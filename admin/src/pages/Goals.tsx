import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGetGoals,
  useUpdateGoals,
  useListFxRates,
  useUpsertFxRate,
  getGetGoalsQueryKey,
  getListFxRatesQueryKey,
  getGetFinanceOverviewQueryKey,
  getGetFinanceProjectionQueryKey,
} from "@workspace/api-client-react";
import { useT } from "@/i18n/I18nProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect, type FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CURRENCIES = [
  { value: "EUR", label: "EUR (€)" },
  { value: "USD", label: "USD ($)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "MGA", label: "MGA (Ar)" },
  { value: "XOF", label: "XOF (CFA)" },
  { value: "CAD", label: "CAD ($)" },
  { value: "CHF", label: "CHF" },
];

export default function Goals() {
  const { t, locale } = useT();
  const intlLocale = locale === "fr" ? "fr-FR" : "en-US";
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: goals } = useGetGoals();
  const { data: fxRates, isLoading: fxLoading } = useListFxRates();
  const updateGoals = useUpdateGoals();
  const upsertFx = useUpsertFxRate();

  const [baseCurrency, setBaseCurrency] = useState("EUR");
  const [target, setTarget] = useState("1000000");
  const [reinvest, setReinvest] = useState(40);
  const [expense, setExpense] = useState(30);
  const [savings, setSavings] = useState(30);

  useEffect(() => {
    if (!goals) return;
    setBaseCurrency(goals.baseCurrency);
    setTarget(String(goals.monthlyTarget));
    setReinvest(goals.reinvestPct);
    setExpense(goals.expensePct);
    setSavings(goals.savingsPct);
  }, [goals]);

  const totalPct = reinvest + expense + savings;

  function saveGoals(e: FormEvent) {
    e.preventDefault();
    if (totalPct !== 100) {
      toast({ title: t("goals.toast.allocError"), variant: "destructive" });
      return;
    }
    updateGoals.mutate(
      {
        data: {
          baseCurrency,
          monthlyTarget: Number(target),
          reinvestPct: reinvest,
          expensePct: expense,
          savingsPct: savings,
        },
      },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getGetGoalsQueryKey() });
          qc.invalidateQueries({ queryKey: getGetFinanceOverviewQueryKey() });
          qc.invalidateQueries({ queryKey: getGetFinanceProjectionQueryKey() });
          toast({ title: t("goals.toast.saved") });
        },
        onError: () => toast({ title: t("goals.toast.error"), variant: "destructive" }),
      },
    );
  }

  const [newCcy, setNewCcy] = useState("USD");
  const [newRate, setNewRate] = useState("0.92");

  function saveFx(e: FormEvent) {
    e.preventDefault();
    const rate = Number(newRate);
    if (!Number.isFinite(rate) || rate <= 0) return;
    upsertFx.mutate(
      { data: { currency: newCcy, rateToBase: rate } },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListFxRatesQueryKey() });
          qc.invalidateQueries({ queryKey: getGetFinanceOverviewQueryKey() });
          toast({ title: t("goals.toast.fxSaved") });
        },
        onError: () => toast({ title: t("goals.toast.error"), variant: "destructive" }),
      },
    );
  }

  return (
    <Shell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-serif font-medium tracking-tight">{t("goals.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("goals.subtitle")}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif font-medium tracking-tight">
                {t("goals.target.title")}
              </CardTitle>
              <CardDescription>{t("goals.target.desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveGoals} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("goals.baseCurrency")}</Label>
                    <Select value={baseCurrency} onValueChange={setBaseCurrency}>
                      <SelectTrigger data-testid="select-baseCurrency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("goals.monthlyTarget")}</Label>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      data-testid="input-monthlyTarget"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <Label>{t("goals.reinvest")}</Label>
                    <span className="font-mono text-sm">{reinvest}%</span>
                  </div>
                  <Slider value={[reinvest]} onValueChange={([v]) => setReinvest(v ?? 0)} max={100} step={5} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <Label>{t("goals.expense")}</Label>
                    <span className="font-mono text-sm">{expense}%</span>
                  </div>
                  <Slider value={[expense]} onValueChange={([v]) => setExpense(v ?? 0)} max={100} step={5} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <Label>{t("goals.savings")}</Label>
                    <span className="font-mono text-sm">{savings}%</span>
                  </div>
                  <Slider value={[savings]} onValueChange={([v]) => setSavings(v ?? 0)} max={100} step={5} />
                </div>

                <p className={`text-sm ${totalPct === 100 ? "text-muted-foreground" : "text-destructive"}`}>
                  {t("goals.total")}: {totalPct}% {totalPct !== 100 && `(${t("goals.must100")})`}
                </p>

                <div className="flex justify-end">
                  <Button type="submit" disabled={updateGoals.isPending} data-testid="button-saveGoals">
                    {updateGoals.isPending ? t("form.saving") : t("form.save")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif font-medium tracking-tight">
                {t("goals.fx.title")}
              </CardTitle>
              <CardDescription>
                {t("goals.fx.desc").replace("{base}", baseCurrency)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-5 bg-primary/5 border-primary/20">
                <Info className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary font-medium">{t("goals.fx.help.title")}</AlertTitle>
                <AlertDescription className="text-muted-foreground space-y-1">
                  <p>{t("goals.fx.help.body")}</p>
                  <p className="text-xs font-mono mt-2">
                    <span className="text-foreground font-semibold">{t("goals.fx.example")}: </span>
                    {t("goals.fx.exampleText")}
                  </p>
                </AlertDescription>
              </Alert>
              <form onSubmit={saveFx} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] items-end mb-5">
                <div className="space-y-2">
                  <Label>{t("goals.fx.currency")}</Label>
                  <Select value={newCcy} onValueChange={setNewCcy}>
                    <SelectTrigger data-testid="select-newCcy">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("goals.fx.rate")}</Label>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    data-testid="input-newRate"
                  />
                </div>
                <Button type="submit" disabled={upsertFx.isPending} data-testid="button-saveFx">
                  {upsertFx.isPending ? "…" : t("goals.fx.save")}
                </Button>
              </form>

              {fxLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("goals.fx.currency")}</TableHead>
                        <TableHead>{t("goals.fx.rate")}</TableHead>
                        <TableHead>{t("goals.fx.updated")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(fxRates ?? []).map((r) => (
                        <TableRow key={r.currency}>
                          <TableCell className="font-mono">{r.currency}</TableCell>
                          <TableCell className="font-mono">{r.rateToBase}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(r.updatedAt).toLocaleDateString(intlLocale)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
