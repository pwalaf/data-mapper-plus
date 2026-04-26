export function formatMoney(
  amount: number | string | null | undefined,
  currency: string | undefined,
  locale: string,
): string {
  if (amount === null || amount === undefined || amount === "") return "—";
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) return "—";
  const code = (currency ?? "EUR").toUpperCase();
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      maximumFractionDigits: code === "MGA" || code === "XOF" ? 0 : 2,
    }).format(n);
  } catch {
    return `${n.toLocaleString(locale)} ${code}`;
  }
}

export function formatNumber(n: number | string | null | undefined, locale: string): string {
  if (n === null || n === undefined || n === "") return "—";
  const v = typeof n === "string" ? Number(n) : n;
  if (!Number.isFinite(v)) return "—";
  return v.toLocaleString(locale);
}

export function formatPercent(pct: number | null | undefined, locale: string): string {
  if (pct === null || pct === undefined || !Number.isFinite(pct)) return "—";
  return `${pct.toLocaleString(locale, { maximumFractionDigits: 1 })} %`;
}

export function formatMonthLabel(monthKey: string, locale: string): string {
  // monthKey: YYYY-MM
  const [y, m] = monthKey.split("-").map(Number);
  if (!y || !m) return monthKey;
  const d = new Date(Date.UTC(y, m - 1, 1));
  return d.toLocaleDateString(locale, { month: "short", year: "2-digit" });
}

export function formatDateTime(value: string | Date | null | undefined, locale: string): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(locale, { dateStyle: "short", timeStyle: "short" });
}

export function formatDate(value: string | Date | null | undefined, locale: string): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(locale);
}

export function toDatetimeLocalInput(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
