// Offline-first transport: intercepts global fetch to queue mutating requests
// when the network is down (or fails) and replays them as soon as the
// connection is restored.

const OUTBOX_KEY = "atlas.outbox.v1";
const SYNTHETIC_HEADER = "x-atlas-offline-stub";

interface SerialisedRequest {
  id: string;
  url: string;
  method: string;
  body: string | null;
  headers: Record<string, string>;
  enqueuedAt: number;
}

type Listener = (snapshot: OfflineSnapshot) => void;
export interface OfflineSnapshot {
  online: boolean;
  pending: number;
  syncing: boolean;
  lastSyncAt: number | null;
  lastError: string | null;
}

const listeners = new Set<Listener>();
let snapshot: OfflineSnapshot = {
  online: typeof navigator === "undefined" ? true : navigator.onLine,
  pending: 0,
  syncing: false,
  lastSyncAt: null,
  lastError: null,
};

let originalFetch: typeof fetch | null = null;
let installed = false;
let onSyncSuccess: (() => void) | null = null;

function notify() {
  for (const fn of listeners) fn(snapshot);
}

function update(patch: Partial<OfflineSnapshot>) {
  snapshot = { ...snapshot, ...patch };
  notify();
}

export function subscribeOffline(fn: Listener): () => void {
  listeners.add(fn);
  fn(snapshot);
  return () => listeners.delete(fn);
}

export function getOfflineSnapshot(): OfflineSnapshot {
  return snapshot;
}

function loadQueue(): SerialisedRequest[] {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveQueue(q: SerialisedRequest[]) {
  try {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(q));
  } catch {
    // ignore quota errors
  }
  update({ pending: q.length });
}

function nextId(): string {
  return `op_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function headersToObject(h: HeadersInit | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!h) return out;
  if (h instanceof Headers) {
    h.forEach((v, k) => {
      out[k] = v;
    });
    return out;
  }
  if (Array.isArray(h)) {
    for (const [k, v] of h) out[k] = v;
    return out;
  }
  return { ...(h as Record<string, string>) };
}

function bodyToString(body: BodyInit | null | undefined): string | null {
  if (body == null) return null;
  if (typeof body === "string") return body;
  // We only enqueue JSON mutations — anything else is dropped.
  return null;
}

function syntheticResponse(payload: unknown, status = 202): Response {
  return new Response(JSON.stringify(payload), {
    status,
    statusText: "Queued",
    headers: { "content-type": "application/json", [SYNTHETIC_HEADER]: "1" },
  });
}

function enqueue(op: Omit<SerialisedRequest, "id" | "enqueuedAt">) {
  const queue = loadQueue();
  const full: SerialisedRequest = {
    ...op,
    id: nextId(),
    enqueuedAt: Date.now(),
  };
  queue.push(full);
  saveQueue(queue);
  return full;
}

async function drain(): Promise<void> {
  if (!originalFetch) return;
  if (snapshot.syncing) return;

  const queue = loadQueue();
  if (queue.length === 0) {
    update({ syncing: false, lastError: null });
    return;
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) return;

  update({ syncing: true, lastError: null });
  let didProgress = false;
  while (true) {
    const current = loadQueue();
    if (current.length === 0) break;
    const op = current[0]!;
    try {
      const resp = await originalFetch(op.url, {
        method: op.method,
        body: op.body ?? undefined,
        headers: op.headers,
        credentials: "include",
      });
      if (!resp.ok && resp.status >= 500) {
        update({
          lastError: `Server ${resp.status} on ${op.method} ${op.url}`,
          syncing: false,
        });
        return;
      }
      // 4xx is a permanent failure — drop the op so the queue doesn't get stuck.
      const after = loadQueue();
      after.shift();
      saveQueue(after);
      didProgress = true;
    } catch (err) {
      update({
        lastError: err instanceof Error ? err.message : String(err),
        syncing: false,
      });
      return;
    }
  }
  update({
    syncing: false,
    lastSyncAt: didProgress ? Date.now() : snapshot.lastSyncAt,
    lastError: null,
  });
  if (didProgress && onSyncSuccess) onSyncSuccess();
}

function isMutating(method: string): boolean {
  const m = method.toUpperCase();
  return m === "POST" || m === "PUT" || m === "PATCH" || m === "DELETE";
}

function resolveUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

export function installOfflineFetch(opts: { onSync?: () => void } = {}): void {
  if (installed || typeof window === "undefined") return;
  installed = true;
  onSyncSuccess = opts.onSync ?? null;
  originalFetch = window.fetch.bind(window);

  // Hydrate snapshot
  update({
    online: navigator.onLine,
    pending: loadQueue().length,
  });

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
    const url = resolveUrl(input);

    if (!isMutating(method)) {
      try {
        return await originalFetch!(input, init);
      } catch (err) {
        // Surface the network error so TanStack Query can fall back to its
        // persisted cache.
        throw err;
      }
    }

    const offline = !navigator.onLine;
    if (offline) {
      const op = enqueue({
        url,
        method,
        body: bodyToString(init?.body ?? null),
        headers: headersToObject(init?.headers),
      });
      return syntheticResponse({ queued: true, id: op.id, op });
    }

    try {
      return await originalFetch!(input, init);
    } catch (err) {
      // Network failure during a mutation — queue and continue optimistically.
      const op = enqueue({
        url,
        method,
        body: bodyToString(init?.body ?? null),
        headers: headersToObject(init?.headers),
      });
      void err;
      return syntheticResponse({ queued: true, id: op.id, op });
    }
  };

  window.addEventListener("online", () => {
    update({ online: true });
    void drain();
  });
  window.addEventListener("offline", () => {
    update({ online: false, syncing: false });
  });

  // Drain on boot in case there are leftover ops from a previous session.
  if (navigator.onLine) {
    void drain();
  }
}

export function flushOutboxNow(): Promise<void> {
  return drain();
}

export function clearOutbox(): void {
  saveQueue([]);
}
