import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { Palette, Moon, Sun, Layers, Languages } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useT, type Locale } from "@/i18n/I18nProvider";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale } = useT();

  return (
    <Shell>
      <div className="flex flex-col gap-8 max-w-4xl w-full">
        <div>
          <h1 className="text-3xl font-serif font-medium tracking-tight">{t("settings.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("settings.subtitle")}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              {t("settings.appearance")}
            </CardTitle>
            <CardDescription>{t("settings.appearance.desc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="dark-mode" className="text-base">{t("settings.darkMode")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("settings.darkMode.desc")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <Switch
                  id="dark-mode"
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
                <Moon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-primary" />
              {t("settings.language")}
            </CardTitle>
            <CardDescription>{t("settings.language.desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label className="text-base">{t("settings.language")}</Label>
              <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              {t("settings.workspace")}
            </CardTitle>
            <CardDescription>{t("settings.workspace.desc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t("settings.workspaceName")}</p>
                <p className="font-medium">Atlas Admin</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t("settings.version")}</p>
                <p className="font-mono text-sm bg-muted inline-block px-2 py-0.5 rounded">v1.0.0</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t("settings.api")}</p>
                <p className="font-mono text-sm text-primary">/api</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t("settings.architecture")}</p>
                <p className="text-sm">Schema-driven · React · Tailwind</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
