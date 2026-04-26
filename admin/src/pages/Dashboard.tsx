import { Shell } from "@/components/layout/Shell";
import {
  useGetFinanceOverview,
  useGetFinanceTimeseries,
  useGetFinanceBySource,
  useListSessions,
  useListStudents,
  useGetGoals,
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useT } from "@/i18n/I18nProvider";
import { useFormatBaseMoney } from "@/hooks/useCurrency";
import { formatMonthLabel, formatPercent } from "@/lib/format";
import { Progress } from "@/components/ui/progress";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Coins, Wallet, Users, Calendar, Target, TrendingUp, TrendingDown } from "lucide-react";

const SOURCE_LABELS: Record<string, string> = {
  tutoring: "Cours",
  apps: "Apps",
  pdfs: "PDF",
  other: "Autre",
};

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--muted-foreground))"];

export default function Dashboard() {
  const { t, locale } = useT();
  const intlLocale = locale === "fr" ? "fr-FR" : "en-US";
  const fmt = useFormatBaseMoney();

  const { data: overview, isLoading: ovLoading } = useGetFinanceOverview();
  const { data: ts, isLoading: tsLoading } = useGetFinanceTimeseries({ months: 12 });
  const { data: bySource, isLoading: bsLoading } = useGetFinanceBySource({ months: 6 });
  const { data: students } = useListStudents();
  const { data: sessions } = useListSessions();
  const { data: goals } = useGetGoals();

  const tsChart = (ts ?? []).map((p) => ({
    label: formatMonthLabel(p.month, intlLocale),
    income: p.income,
    expense: p.expense,
  }));

  const pieData = (bySource ?? [])
    .map((s) => ({ name: SOURCE_LABELS[s.source] ?? s.source, value: s.income }))
    .filter((p) => p.value > 0);

  const activeStudents = (students ?? []).filter((s) => s.status === "active").length;
  const upcomingSessions = (sessions ?? []).filter((s) => new Date(s.occurredAt) > new Date()).length;
  const monthDelta =
    overview && overview.prevMonthIncome > 0
      ? ((overview.monthIncome - overview.prevMonthIncome) / overview.prevMonthIncome) * 100
      : null;

  return (
    <Shell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-serif font-medium tracking-tight">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("dashboard.subtitle")}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Kpi
            label={t("dashboard.kpi.monthIncome")}
            value={ovLoading ? null : fmt(overview?.monthIncome)}
            icon={<Coins className="h-4 w-4" />}
            hint={
              ovLoading
                ? null
                : monthDelta === null
                  ? t("finances.kpi.firstMonth")
                  : `${monthDelta >= 0 ? "+" : ""}${monthDelta.toFixed(1)}% ${t("finances.kpi.vsPrev")}`
            }
            tone={monthDelta == null ? "neutral" : monthDelta >= 0 ? "up" : "down"}
          />
          <Kpi
            label={t("dashboard.kpi.monthNet")}
            value={ovLoading ? null : fmt(overview?.monthNet)}
            icon={<Wallet className="h-4 w-4" />}
            hint={ovLoading ? null : `${fmt(overview?.monthExpense)} ${t("finances.kpi.expenses")}`}
            tone={overview && overview.monthNet >= 0 ? "up" : "down"}
          />
          <Kpi
            label={t("dashboard.kpi.activeStudents")}
            value={String(activeStudents)}
            icon={<Users className="h-4 w-4" />}
            hint={`${upcomingSessions} ${t("dashboard.kpi.upcoming")}`}
            tone="neutral"
          />
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-xs">
                <Target className="h-4 w-4" />
                {t("dashboard.kpi.target")}
              </CardDescription>
              <CardTitle className="text-2xl font-serif font-medium tracking-tight">
                {ovLoading ? <Skeleton className="h-7 w-32" /> : formatPercent(overview?.targetProgressPct, intlLocale)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={overview?.targetProgressPct ?? 0} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {fmt(overview?.monthIncome)} / {fmt(goals?.monthlyTarget)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="font-serif font-medium tracking-tight">{t("dashboard.evolution.title")}</CardTitle>
              <CardDescription>{t("dashboard.evolution.desc")}</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {tsLoading ? (
                <Skeleton className="h-[320px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={tsChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dashIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => fmt(v)} width={90} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6 }}
                      formatter={(v: number) => fmt(v)}
                    />
                    <Legend />
                    <Area name={t("finances.income")} type="monotone" dataKey="income" stroke="hsl(var(--primary))" fill="url(#dashIncomeGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="font-serif font-medium tracking-tight">{t("dashboard.bySource.title")}</CardTitle>
              <CardDescription>{t("dashboard.bySource.desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {bsLoading ? (
                <Skeleton className="h-[260px] w-full" />
              ) : pieData.length === 0 ? (
                <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
                  {t("dashboard.bySource.empty")}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6 }}
                      formatter={(v: number) => fmt(v)}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif font-medium tracking-tight">{t("dashboard.recentSessions.title")}</CardTitle>
            <CardDescription>{t("dashboard.recentSessions.desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {(sessions ?? []).length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center">
                {t("dashboard.recentSessions.empty")}
              </div>
            ) : (
              <div className="space-y-4">
                {(sessions ?? []).slice(0, 5).map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{s.studentName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(s.occurredAt).toLocaleString(intlLocale, {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                          {" · "}
                          {s.durationMinutes} min
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono">
                        {new Intl.NumberFormat(intlLocale, { style: "currency", currency: s.currency }).format(s.amount)}
                      </p>
                      <p className={`text-xs ${s.paid ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {s.paid ? t("sessions.paid") : t("sessions.unpaid")}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}

function Kpi({
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
