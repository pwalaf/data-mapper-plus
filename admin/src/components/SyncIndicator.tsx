import { useOffline } from "@/hooks/useOffline";
import { useT } from "@/i18n/I18nProvider";
import { Cloud, CloudOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export function SyncIndicator({ compact = false }: { compact?: boolean }) {
  const { t } = useT();
  const { online, pending, syncing, lastSyncAt, lastError, flush } = useOffline();

  let icon = <Cloud className="h-4 w-4" />;
  let label: string;
  let tone = "text-muted-foreground";
  let dotTone = "bg-emerald-500";

  if (!online) {
    icon = <CloudOff className="h-4 w-4" />;
    label = t("sync.offline");
    tone = "text-amber-500";
    dotTone = "bg-amber-500";
  } else if (syncing) {
    icon = <RefreshCw className="h-4 w-4 animate-spin" />;
    label = t("sync.syncing");
    tone = "text-blue-500";
    dotTone = "bg-blue-500";
  } else if (pending > 0) {
    icon = <CloudOff className="h-4 w-4" />;
    label = `${pending} ${pending > 1 ? t("sync.pending.plural") : t("sync.pending.one")}`;
    tone = "text-amber-500";
    dotTone = "bg-amber-500";
  } else {
    icon = <CheckCircle2 className="h-4 w-4" />;
    label = t("sync.online");
    tone = "text-emerald-500";
    dotTone = "bg-emerald-500";
  }

  const node = (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => flush()}
      data-testid="sync-indicator"
      className={`gap-2 ${tone}`}
    >
      <span className={`h-2 w-2 rounded-full ${dotTone}`} />
      {icon}
      {!compact && <span className="text-xs">{label}</span>}
    </Button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{node}</TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs space-y-1">
        <p className="font-medium">{label}</p>
        {pending > 0 && <p className="text-xs text-muted-foreground">{t("sync.tooltip.pending").replace("{n}", String(pending))}</p>}
        {lastSyncAt && <p className="text-xs text-muted-foreground">{t("sync.tooltip.lastSync")}: {new Date(lastSyncAt).toLocaleTimeString()}</p>}
        {lastError && <p className="text-xs text-destructive">{lastError}</p>}
        <p className="text-xs text-muted-foreground italic">{t("sync.tooltip.hint")}</p>
      </TooltipContent>
    </Tooltip>
  );
}
