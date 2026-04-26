import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FieldSchema } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit2, Trash2, ArrowUp, ArrowDown, ArrowUpDown, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useMemo, useState, type MouseEvent } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { formatDate, formatDateTime, formatMoney, formatNumber } from "@/lib/format";

export interface SchemaTableProps<T> {
  schema: FieldSchema[];
  data: T[];
  isLoading: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onRowClick?: (item: T) => void;
  selectable?: boolean;
  selection?: (string | number)[];
  onSelectionChange?: (ids: (string | number)[]) => void;
  emptyLabel?: string;
}

const toneClassMap: Record<string, string> = {
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
  danger: "bg-destructive/15 text-destructive border-destructive/20",
  info: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

function renderCellValue<T>(row: T, field: FieldSchema, locale: string) {
  const value = (row as Record<string, unknown>)[field.key];
  if (value === null || value === undefined || value === "")
    return <span className="text-muted-foreground">—</span>;

  switch (field.type) {
    case "currency": {
      const currency = field.currencyField
        ? ((row as Record<string, unknown>)[field.currencyField] as string | undefined)
        : undefined;
      return formatMoney(value as number, currency, locale);
    }
    case "number":
      return formatNumber(value as number, locale);
    case "integer":
      return `${field.prefix ?? ""}${formatNumber(value as number, locale)}${field.suffix ?? ""}`;
    case "date":
      return formatDate(value as string, locale);
    case "datetime":
      return formatDateTime(value as string, locale);
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
    case "select":
    case "text":
    default: {
      const option = field.options?.find((o) => o.value === value);
      return `${field.prefix ?? ""}${option?.label ?? value}${field.suffix ?? ""}`;
    }
  }
}

export function SchemaTable<T extends { id: string | number }>({
  schema,
  data,
  isLoading,
  onEdit,
  onDelete,
  onRowClick,
  selectable = false,
  selection = [],
  onSelectionChange,
  emptyLabel,
}: SchemaTableProps<T>) {
  const { t, locale } = useI18n();
  const visibleFields = useMemo(() => schema.filter((f) => f.showInTable !== false), [schema]);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const field = visibleFields.find((f) => f.key === sortKey);
    if (!field) return data;
    const arr = [...data];
    arr.sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey];
      const bv = (b as Record<string, unknown>)[sortKey];
      if (av === bv) return 0;
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      let cmp: number;
      if (field.type === "number" || field.type === "currency" || field.type === "integer") {
        cmp = Number(av) - Number(bv);
      } else if (field.type === "date" || field.type === "datetime") {
        cmp = new Date(String(av)).getTime() - new Date(String(bv)).getTime();
      } else if (field.type === "boolean") {
        cmp = Number(Boolean(av)) - Number(Boolean(bv));
      } else {
        cmp = String(av).localeCompare(String(bv), locale);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [data, sortKey, sortDir, visibleFields, locale]);

  const allVisibleIds = useMemo(() => sorted.map((r) => r.id), [sorted]);
  const selectionSet = useMemo(() => new Set(selection), [selection]);
  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectionSet.has(id));
  const someSelected = !allSelected && allVisibleIds.some((id) => selectionSet.has(id));

  function toggleRow(id: string | number) {
    if (!onSelectionChange) return;
    const next = new Set(selectionSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(Array.from(next));
  }

  function toggleAll() {
    if (!onSelectionChange) return;
    if (allSelected) {
      const remaining = selection.filter((id) => !allVisibleIds.includes(id));
      onSelectionChange(remaining);
    } else {
      const next = new Set(selectionSet);
      for (const id of allVisibleIds) next.add(id);
      onSelectionChange(Array.from(next));
    }
  }

  function toggleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null);
    }
  }

  function handleRowClick(e: MouseEvent, row: T) {
    if (!onRowClick) return;
    const target = e.target as HTMLElement;
    if (target.closest("[data-stop-row-click]")) return;
    onRowClick(row);
  }

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && <TableHead className="w-[40px]"></TableHead>}
              {visibleFields.map((f) => (
                <TableHead key={f.key}>{f.label}</TableHead>
              ))}
              {(onEdit || onDelete) && <TableHead className="w-[100px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                {selectable && (
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                )}
                {visibleFields.map((f) => (
                  <TableCell key={f.key}>
                    <Skeleton className="h-4 w-[80%]" />
                  </TableCell>
                ))}
                {(onEdit || onDelete) && (
                  <TableCell>
                    <Skeleton className="h-8 w-16" />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed">
        <p className="text-muted-foreground">{emptyLabel ?? t("table.empty")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {selectable && (
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                  data-testid="select-all"
                />
              </TableHead>
            )}
            {visibleFields.map((f) => {
              const sortable = f.sortable !== false;
              const isActive = sortKey === f.key;
              const Icon = !isActive ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
              return (
                <TableHead
                  key={f.key}
                  className="h-10 text-xs font-medium tracking-wider text-muted-foreground"
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(f.key)}
                      data-testid={`sort-${f.key}`}
                      data-stop-row-click
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <span>{f.label}</span>
                      <Icon className={`h-3.5 w-3.5 ${isActive ? "text-foreground" : "opacity-50"}`} />
                    </button>
                  ) : (
                    <span>{f.label}</span>
                  )}
                </TableHead>
              );
            })}
            {(onEdit || onDelete) && <TableHead className="text-right"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row) => {
            const isSelected = selectionSet.has(row.id);
            return (
              <TableRow
                key={row.id}
                data-state={isSelected ? "selected" : undefined}
                onClick={(e) => handleRowClick(e, row)}
                className={`group transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted/40 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {selectable && (
                  <TableCell data-stop-row-click>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleRow(row.id)}
                      aria-label={`Select ${row.id}`}
                      data-testid={`row-select-${row.id}`}
                    />
                  </TableCell>
                )}
                {visibleFields.map((f) => (
                  <TableCell key={f.key} className="py-3 align-middle text-sm">
                    {renderCellValue(row, f, locale === "fr" ? "fr-FR" : "en-US")}
                  </TableCell>
                ))}
                {(onEdit || onDelete) && (
                  <TableCell className="py-2 text-right" data-stop-row-click>
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => onEdit(row)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => onDelete(row)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
