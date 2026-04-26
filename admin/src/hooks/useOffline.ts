import { useEffect, useState } from "react";
import { subscribeOffline, getOfflineSnapshot, flushOutboxNow, type OfflineSnapshot } from "@/lib/offline";

export function useOffline(): OfflineSnapshot & { flush: () => Promise<void> } {
  const [snap, setSnap] = useState<OfflineSnapshot>(() => getOfflineSnapshot());
  useEffect(() => subscribeOffline(setSnap), []);
  return { ...snap, flush: flushOutboxNow };
}
