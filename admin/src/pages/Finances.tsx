import { Shell } from "@/components/layout/Shell";
import {
  useGetFinanceOverview,
  useGetFinanceTimeseries,
  useGetFinanceBySource,
  useGetFinanceProjection,
  useGetGoals,
} from "@workspace/api-client-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useT } from "@/i18n/I18nProvider";
import { useFormatBaseMoney } from "@/hooks/useCurrency";
import { formatMonthLabel, formatPercent } from "@/lib/format";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, TrendingDown, Wallet, Target, Coins } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const SOURCE_LABELS: Record<string, string> = {
  tutoring: "Cours",
  apps: "Apps",
  pdfs: "PDF",
  other: "Autre",
};

export default function Finances() {
  const { t, locale } = useT();
  const fmt = useFormatBaseMoney();
  const intlLocale = locale === "fr" ? "fr-FR" : "en-US";

  const [degree, setDegree] = useState<1 | 2 | 3>(1);
  const [tsMonths, setTsMonths] = useState<6 | 12 | 24>(12);

  const { data: overview, isLoading: ovLoading } = useGetFinanceOverview();
  const { data: ts, isLoading: tsLoading } = useGetFinanceTimeseries({
    months: tsMonths,
  });
  const { data: bySource, isLoading: bsLoading } = useGetFinanceBySource({
    months: 6,
  });
  const { data: projection, isLoading: pjLoading } = useGetFinanceProjection({
    months: 6,
    degree,
  });
  const { data: goals } = useGetGoals();

  const tsChart = (ts ?? []).map((p) => ({
    label: formatMonthLabel(p.month, intlLocale),
    income: p.income,
    expense: p.expense,
    net: p.net,
  }));

  const bySourceChart = (bySource ?? []).map((s) => ({
    source: SOURCE_LABELS[s.source] ?? s.source,
    income: s.income,
  }));

  const projChart = [
    ...((projection?.history ?? []).map((p) => ({
      label: formatMonthLabel(p.month, intlLocale),
      actual: p.income,
    })) as Array<{ label: string; actual?: number; forecast?: number }>),
    ...((projection?.forecast ?? []).map((p) => ({
      label: formatMonthLabel(p.month, intlLocale),
      forecast: p.income,
    })) as Array<{ label: string; actual?: number; forecast?: number }>),
  ];

  const monthDelta =
    overview && overview.prevMonthIncome > 0
      ? ((overview.monthIncome - overview.prevMonthIncome) /
          overview.prevMonthIncome) *
        100
      : null;

  return (
    <Shell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-serif font-medium tracking-tight">
            {t("finances.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("finances.subtitle")}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label={t("finances.kpi.month")}
            value={ovLoading ? null : fmt(overview?.monthIncome)}
            hint={
              ovLoading
                ? null
                : monthDelta === null
                  ? t("finances.kpi.firstMonth")
                  : `${monthDelta >= 0 ? "+" : ""}${monthDelta.toFixed(1)}% ${t("finances.kpi.vsPrev")}`
            }
            tone={
              monthDelta !== null && monthDelta >= 0
                ? "up"
                : monthDelta === null
                  ? "neutral"
                  : "down"
            }
            icon={<Coins className="h-4 w-4" />}
          />
          <KpiCard
            label={t("finances.kpi.net")}
            value={ovLoading ? null : fmt(overview?.monthNet)}
            hint={
              ovLoading
                ? null
                : `${fmt(overview?.monthExpense)} ${t("finances.kpi.expenses")}`
            }
            tone={overview && overview.monthNet >= 0 ? "up" : "down"}
            icon={<Wallet className="h-4 w-4" />}
          />
          <KpiCard
            label={t("finances.kpi.unpaid")}
            value={ovLoading ? null : fmt(overview?.unpaidSessions)}
            hint={t("finances.kpi.unpaidHint")}
            tone="neutral"
            icon={<TrendingDown className="h-4 w-4" />}
          />
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-xs">
                <Target className="h-4 w-4" />
                {t("finances.kpi.target")}
              </CardDescription>
              <CardTitle className="text-2xl font-serif font-medium tracking-tight">
                {ovLoading ? (
                  <Skeleton className="h-7 w-32" />
                ) : (
                  formatPercent(overview?.targetProgressPct, intlLocale)
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress
                value={overview?.targetProgressPct ?? 0}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {fmt(overview?.monthIncome)} / {fmt(overview?.monthlyTarget)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="font-serif font-medium tracking-tight">
                {t("finances.evolution.title")}
              </CardTitle>
              <CardDescription>{t("finances.evolution.desc")}</CardDescription>
            </div>
            <Select
              value={String(tsMonths)}
              onValueChange={(v) => setTsMonths(Number(v) as 6 | 12 | 24)}
            >
              <SelectTrigger
                className="w-[160px]"
                data-testid="select-tsMonths"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">{t("finances.range.6m")}</SelectItem>
                <SelectItem value="12">{t("finances.range.12m")}</SelectItem>
                <SelectItem value="24">{t("finances.range.24m")}</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {tsLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={tsChart}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="incomeGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="100%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="expenseGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="hsl(var(--destructive))"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="100%"
                          stopColor="hsl(var(--destructive))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="label"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(v) => fmt(v)}
                      width={90}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 6,
                      }}
                      formatter={(v: number) => fmt(v)}
                    />
                    <Legend />
                    <Area
                      name={t("finances.income")}
                      type="monotone"
                      dataKey="income"
                      stroke="hsl(var(--primary))"
                      fill="url(#incomeGrad)"
                      strokeWidth={2}
                    />
                    <Area
                      name={t("finances.expense")}
                      type="monotone"
                      dataKey="expense"
                      stroke="hsl(var(--destructive))"
                      fill="url(#expenseGrad)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif font-medium tracking-tight">
                {t("finances.bySource.title")}
              </CardTitle>
              <CardDescription>{t("finances.bySource.desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {bsLoading ? (
                <Skeleton className="h-[260px] w-full" />
              ) : (
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={bySourceChart}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="source"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(v) => fmt(v)}
                        width={90}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 6,
                        }}
                        formatter={(v: number) => fmt(v)}
                      />
                      <Bar
                        dataKey="income"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="font-serif font-medium tracking-tight">
                  {t("finances.projection.title")}
                </CardTitle>
                <CardDescription>
                  {t("finances.projection.desc")}
                </CardDescription>
              </div>
              <Select
                value={String(degree)}
                onValueChange={(v) => setDegree(Number(v) as 1 | 2 | 3)}
              >
                <SelectTrigger
                  className="w-[180px]"
                  data-testid="select-degree"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">
                    {t("finances.projection.linear")}
                  </SelectItem>
                  <SelectItem value="2">
                    {t("finances.projection.quadratic")}
                  </SelectItem>
                  <SelectItem value="3">
                    {t("finances.projection.cubic")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {pjLoading ? (
                <Skeleton className="h-[260px] w-full" />
              ) : (
                <>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={projChart}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="label"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickFormatter={(v) => fmt(v)}
                          width={90}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 6,
                          }}
                          formatter={(v: number) => fmt(v)}
                        />
                        <Legend />
                        <Line
                          name={t("finances.projection.actual")}
                          type="monotone"
                          dataKey="actual"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          name={t("finances.projection.forecast")}
                          type="monotone"
                          dataKey="forecast"
                          stroke="hsl(var(--primary))"
                          strokeDasharray="6 4"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">
                        {t("finances.projection.rsq")}
                      </p>
                      <p className="font-mono text-lg">
                        {(projection?.rSquared ?? 0).toFixed(3)}
                      </p>
                    </div>
                    <div className="rounded-md border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">
                        {t("finances.projection.toTarget")}
                      </p>
                      <p className="font-mono text-lg">
                        {projection?.monthsToTarget == null
                          ? "—"
                          : `${projection.monthsToTarget} ${t("finances.projection.months")}`}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {t("finances.projection.targetLabel")}:{" "}
                    {fmt(goals?.monthlyTarget)}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}

function KpiCard({
  label,
  value,
  hint,
  tone,
  icon,
}: {
  label: string;
  value: string | null;
  hint: string | null;
  tone: "up" | "down" | "neutral";
  icon: React.ReactNode;
}) {
  const toneClass =
    tone === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "down"
        ? "text-destructive"
        : "text-muted-foreground";
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2 text-xs">
          {icon}
          {label}
        </CardDescription>
        <CardTitle className="text-2xl font-serif font-medium tracking-tight">
          {value === null ? <Skeleton className="h-7 w-32" /> : value}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-xs flex items-center gap-1 ${toneClass}`}>
          {tone === "up" && <TrendingUp className="h-3 w-3" />}
          {tone === "down" && <TrendingDown className="h-3 w-3" />}
          {hint ?? ""}
        </p>
      </CardContent>
    </Card>
  );
}
