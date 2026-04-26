import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { FieldSchema } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/I18nProvider";
import { formatDate, formatDateTime, formatMoney, formatNumber } from "@/lib/format";
import { Check, Minus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const toneClassMap: Record<string, string> = {
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
  danger: "bg-destructive/15 text-destructive border-destructive/20",
  info: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

interface DetailSheetProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: T | null;
  schema: FieldSchema[];
  titleField?: string;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

function renderValue(value: unknown, field: FieldSchema, row: Record<string, unknown>, locale: string) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground italic">—</span>;
  }
  switch (field.type) {
    case "currency": {
      const currency = field.currencyField
        ? (row[field.currencyField] as string | undefined)
        : undefined;
      return <span className="font-mono text-sm">{formatMoney(value as number, currency, locale)}</span>;
    }
    case "number":
      return <span className="font-mono text-sm">{formatNumber(value as number, locale)}</span>;
    case "integer":
      return (
        <span className="font-mono text-sm">
          {field.prefix ?? ""}
          {formatNumber(value as number, locale)}
          {field.suffix ?? ""}
        </span>
      );
    case "date":
      return <span className="text-sm">{formatDate(value as string, locale)}</span>;
    case "datetime":
      return <span className="text-sm">{formatDateTime(value as string, locale)}</span>;
    case "boolean":
      return value ? (
        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm">
          <Check className="h-4 w-4" />
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
          <Minus className="h-4 w-4" />
        </span>
      );
    case "badge": {
      const option = field.options?.find((o) => o.value === value);
      const tone = option?.tone || "neutral";
      return (
        <Badge variant="outline" className={toneClassMap[tone]}>
          {option?.label || String(value)}
        </Badge>
      );
    }
    case "textarea":
      return <span className="text-sm whitespace-pre-wrap">{String(value)}</span>;
    case "select":
    case "text":
    default: {
      const option = field.options?.find((o) => o.value === value);
      return <span className="text-sm">{option?.label ?? String(value)}</span>;
    }
  }
}

export function DetailSheet<T extends { id: string | number }>({
  open,
  onOpenChange,
  item,
  schema,
  titleField,
  onEdit,
  onDelete,
}: DetailSheetProps<T>) {
  const { t, locale } = useI18n();
  const intlLocale = locale === "fr" ? "fr-FR" : "en-US";

  if (!item) return null;
  const row = item as unknown as Record<string, unknown>;
  const titleValue = (titleField ? row[titleField] : null) ?? `#${row.id}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[520px] overflow-y-auto w-[90vw]">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-serif font-medium tracking-tight text-2xl">
            {String(titleValue)}
          </SheetTitle>
          <SheetDescription>{t("detail.subtitle")}</SheetDescription>
        </SheetHeader>

        <dl className="grid gap-4">
          {schema.map((field) => (
            <div
              key={field.key}
              className="grid grid-cols-3 gap-3 items-start border-b border-border/40 pb-3 last:border-0"
            >
              <dt className="text-xs uppercase tracking-wider text-muted-foreground font-medium col-span-1">
                {field.label}
              </dt>
              <dd className="col-span-2">{renderValue(row[field.key], field, row, intlLocale)}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex items-center gap-3 justify-end">
          {onEdit && (
            <Button
              variant="outline"
              onClick={() => {
                onEdit(item);
                onOpenChange(false);
              }}
              data-testid="detail-edit"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              {t("detail.edit")}
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive border-destructive/30"
              onClick={() => {
                onDelete(item);
                onOpenChange(false);
              }}
              data-testid="detail-delete"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("detail.delete")}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
