import { useGetGoals, useListFxRates } from "@workspace/api-client-react";
import { useI18n } from "@/i18n/I18nProvider";
import { formatMoney } from "@/lib/format";
import { useCallback } from "react";

export function useBaseCurrency() {
  const { data } = useGetGoals();
  return data?.baseCurrency ?? "EUR";
}

export function useFxRates(): Record<string, number> {
  const { data } = useListFxRates();
  const map: Record<string, number> = {};
  if (data) for (const r of data) map[r.currency] = r.rateToBase;
  return map;
}

export function useToBase() {
  const base = useBaseCurrency();
  const rates = useFxRates();
  return useCallback(
    (amount: number, currency: string) => {
      if (!Number.isFinite(amount)) return 0;
      if (currency === base) return amount;
      const r = rates[currency];
      if (!r) return amount;
      return amount * r;
    },
    [base, rates],
  );
}

export function useFormatMoney() {
  const { locale } = useI18n();
  return useCallback(
    (amount: number | string | null | undefined, currency?: string) =>
      formatMoney(amount, currency, locale === "fr" ? "fr-FR" : "en-US"),
    [locale],
  );
}

export function useFormatBaseMoney() {
  const base = useBaseCurrency();
  const fmt = useFormatMoney();
  return useCallback((amount: number | string | null | undefined) => fmt(amount, base), [base, fmt]);
}
