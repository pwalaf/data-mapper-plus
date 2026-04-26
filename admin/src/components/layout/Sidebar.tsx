import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Package,
  Database,
  Settings,
  GraduationCap,
  Calendar,
  Receipt,
  TrendingUp,
  Target,
} from "lucide-react";
import { useT } from "@/i18n/I18nProvider";
import { SyncIndicator } from "@/components/SyncIndicator";

const NAV_ITEMS = [
  { href: "/", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/students", labelKey: "nav.students", icon: GraduationCap },
  { href: "/sessions", labelKey: "nav.sessions", icon: Calendar },
  { href: "/transactions", labelKey: "nav.transactions", icon: Receipt },
  { href: "/finances", labelKey: "nav.finances", icon: TrendingUp },
  { href: "/goals", labelKey: "nav.goals", icon: Target },
  { href: "/products", labelKey: "nav.catalog", icon: Package },
  { href: "/schema", labelKey: "nav.schema", icon: Database },
  { href: "/settings", labelKey: "nav.settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();
  const { t } = useT();

  return (
    <div className="hidden border-r bg-sidebar md:flex md:w-64 md:shrink-0 md:flex-col min-h-[100dvh]">
      <div className="flex h-14 items-center border-b px-6">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <div className="h-6 w-6 rounded-sm bg-primary flex items-center justify-center">
            <div className="h-3 w-3 rounded-[1px] bg-primary-foreground" />
          </div>
          <span>{t("app.name")}</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`nav-${item.href.replace(/\//g, "") || "home"}`}
                className={`flex items-center gap-3 rounded-md px-3 py-2 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t px-3 py-2">
        <SyncIndicator />
      </div>
    </div>
  );
}
