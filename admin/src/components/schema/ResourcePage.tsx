import { Shell } from "@/components/layout/Shell";
import { useGetResourceSchema, getGetResourceSchemaQueryKey } from "@workspace/api-client-react";
import { SchemaTable } from "@/components/schema/SchemaTable";
import { SchemaForm } from "@/components/schema/SchemaForm";
import { DetailSheet } from "@/components/schema/DetailSheet";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, X, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useT } from "@/i18n/I18nProvider";
import { formatDate, formatDateTime, formatMoney, formatNumber } from "@/lib/format";

interface MutationLike<TArgs> {
  mutate: (args: TArgs, opts?: { onSuccess?: () => void; onError?: () => void }) => void;
  isPending: boolean;
}

interface ResourcePageProps<T extends { id: number }> {
  resource: "products" | "students" | "sessions" | "transactions";
  titleKey: string;
  subtitleKey: string;
  data: T[] | undefined;
  isLoading: boolean;
  listQueryKey: QueryKey;
  createMutation: MutationLike<{ data: unknown }>;
  updateMutation: MutationLike<{ id: number; data: unknown }>;
  deleteMutation: MutationLike<{ id: number }>;
  buildPayload?: (raw: Record<string, unknown>) => Record<string, unknown>;
  buildEditDefaults?: (item: T) => Record<string, unknown>;
}

export function ResourcePage<T extends { id: number }>(props: ResourcePageProps<T>) {
  const {
    resource,
    titleKey,
    subtitleKey,
    data,
    isLoading,
    listQueryKey,
    createMutation,
    updateMutation,
    deleteMutation,
    buildPayload,
    buildEditDefaults,
  } = props;
  const { t, locale } = useT();
  const intlLocale = locale === "fr" ? "fr-FR" : "en-US";
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: schema, isLoading: schemaLoading } = useGetResourceSchema(resource);

  // ---- Filters: column dropdown + per-column criteria ----
  const filterableFields = useMemo(
    () => (schema?.fields ?? []).filter((f) => f.showInTable !== false),
    [schema],
  );
  const defaultColumn = useMemo(() => {
    if (!schema) return "_all";
    return schema.titleField || schema.fields[0]?.key || "_all";
  }, [schema]);

  const [filterColumn, setFilterColumn] = useState<string>("_all");
  const [filterText, setFilterText] = useState("");
  const [filterSelect, setFilterSelect] = useState<string>("__all__");

  useEffect(() => {
    if (!schema) return;
    setFilterColumn(defaultColumn);
    setFilterText("");
    setFilterSelect("__all__");
  }, [defaultColumn, schema]);

  const activeField = useMemo(
    () => (filterColumn === "_all" ? null : filterableFields.find((f) => f.key === filterColumn) ?? null),
    [filterColumn, filterableFields],
  );

  function valueAsSearchableString(value: unknown, field?: { type?: string; currencyField?: string; options?: { value: string; label: string }[] }, row?: Record<string, unknown>): string {
    if (value === null || value === undefined) return "";
    if (typeof value === "boolean") return value ? "oui yes true 1" : "non no false 0";
    if (field) {
      switch (field.type) {
        case "currency": {
          const currency = field.currencyField ? (row?.[field.currencyField] as string | undefined) : undefined;
          return `${formatMoney(value as number, currency, intlLocale)} ${value}`;
        }
        case "number":
        case "integer":
          return `${formatNumber(value as number, intlLocale)} ${value}`;
        case "date":
          return `${formatDate(value as string, intlLocale)} ${value}`;
        case "datetime":
          return `${formatDateTime(value as string, intlLocale)} ${value}`;
        case "badge":
        case "select": {
          const opt = field.options?.find((o) => o.value === value);
          return `${opt?.label ?? ""} ${value}`;
        }
      }
    }
    return String(value);
  }

  const filtered = useMemo<T[]>(() => {
    if (!data) return [];
    let rows = data;
    if (filterText.trim().length > 0) {
      const needle = filterText.trim().toLowerCase();
      rows = rows.filter((row) => {
        const obj = row as unknown as Record<string, unknown>;
        if (filterColumn === "_all") {
          return filterableFields.some((f) =>
            valueAsSearchableString(obj[f.key], f, obj).toLowerCase().includes(needle),
          );
        }
        const f = activeField ?? undefined;
        return valueAsSearchableString(obj[filterColumn], f, obj).toLowerCase().includes(needle);
      });
    }
    if (
      activeField &&
      (activeField.type === "select" || activeField.type === "badge") &&
      filterSelect !== "__all__"
    ) {
      rows = rows.filter((row) => String((row as unknown as Record<string, unknown>)[filterColumn]) === filterSelect);
    }
    return rows;
  }, [data, filterText, filterColumn, filterSelect, activeField, filterableFields, intlLocale]);

  // ---- Selection ----
  const [selection, setSelection] = useState<(string | number)[]>([]);
  // Drop selections that are no longer in filtered set
  useEffect(() => {
    if (selection.length === 0) return;
    const ids = new Set(filtered.map((r) => r.id));
    const remaining = selection.filter((id) => ids.has(id as number));
    if (remaining.length !== selection.length) setSelection(remaining);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<T | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<T | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  function handleCreate() {
    setEditing(null);
    setIsFormOpen(true);
  }

  function handleEdit(item: T) {
    setEditing(item);
    setIsFormOpen(true);
  }

  function handleDeleteClick(item: T) {
    setDeleting(item);
    setIsDeleteOpen(true);
  }

  function handleRowClick(item: T) {
    setDetailItem(item);
    setIsDetailOpen(true);
  }

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: listQueryKey });
    queryClient.invalidateQueries({ queryKey: ["/api/finance/overview"] });
    queryClient.invalidateQueries({ queryKey: ["/api/finance/timeseries"] });
    queryClient.invalidateQueries({ queryKey: ["/api/finance/by-source"] });
    queryClient.invalidateQueries({ queryKey: ["/api/finance/projection"] });
  }

  function onSubmit(raw: Record<string, unknown>) {
    const payload = buildPayload ? buildPayload(raw) : raw;
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, data: payload },
        {
          onSuccess: () => {
            invalidate();
            setIsFormOpen(false);
            toast({ title: t("crud.toast.updated") });
          },
          onError: () => toast({ title: t("crud.toast.errorUpdate"), variant: "destructive" }),
        },
      );
    } else {
      createMutation.mutate(
        { data: payload },
        {
          onSuccess: () => {
            invalidate();
            setIsFormOpen(false);
            toast({ title: t("crud.toast.created") });
          },
          onError: () => toast({ title: t("crud.toast.errorCreate"), variant: "destructive" }),
        },
      );
    }
  }

  function confirmDelete() {
    if (!deleting) return;
    deleteMutation.mutate(
      { id: deleting.id },
      {
        onSuccess: () => {
          invalidate();
          setIsDeleteOpen(false);
          toast({ title: t("crud.toast.deleted") });
        },
        onError: () => toast({ title: t("crud.toast.errorDelete"), variant: "destructive" }),
      },
    );
  }

  async function confirmBulkDelete() {
    const ids = selection.map((id) => Number(id)).filter((n) => Number.isFinite(n));
    let success = 0;
    for (const id of ids) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise<void>((resolve) => {
        deleteMutation.mutate(
          { id },
          {
            onSuccess: () => {
              success++;
              resolve();
            },
            onError: () => resolve(),
          },
        );
      });
    }
    invalidate();
    setIsBulkDeleteOpen(false);
    setSelection([]);
    toast({
      title: t("crud.toast.bulkDeleted").replace("{n}", String(success)),
    });
  }

  const editDefaults = editing
    ? buildEditDefaults
      ? buildEditDefaults(editing)
      : (editing as unknown as Record<string, unknown>)
    : undefined;

  return (
    <Shell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif font-medium tracking-tight">{t(titleKey)}</h1>
            <p className="text-muted-foreground mt-1">{t(subtitleKey)}</p>
          </div>
          <Button onClick={handleCreate} data-testid="button-new">
            <Plus className="h-4 w-4 mr-2" />
            {t("crud.new")}
          </Button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <Select value={filterColumn} onValueChange={(v) => { setFilterColumn(v); setFilterSelect("__all__"); }}>
            <SelectTrigger className="md:w-[200px] bg-background" data-testid="select-filter-column">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">{t("crud.filter.allColumns")}</SelectItem>
              {filterableFields.map((f) => (
                <SelectItem key={f.key} value={f.key}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={
                activeField
                  ? `${t("crud.filter.in")} ${activeField.label.toLowerCase()}…`
                  : t("crud.search")
              }
              className="pl-9 bg-background"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              data-testid="input-search"
            />
          </div>

          {activeField && (activeField.type === "select" || activeField.type === "badge") && activeField.options && (
            <Select value={filterSelect} onValueChange={setFilterSelect}>
              <SelectTrigger className="md:w-[180px] bg-background" data-testid="select-filter-value">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t("crud.filter.any")}</SelectItem>
                {activeField.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {(filterText || filterSelect !== "__all__" || filterColumn !== defaultColumn) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterText("");
                setFilterColumn(defaultColumn);
                setFilterSelect("__all__");
              }}
              data-testid="button-clear-filters"
            >
              <X className="h-4 w-4 mr-1" />
              {t("crud.filter.clear")}
            </Button>
          )}
        </div>

        {/* Selection action bar */}
        {selection.length > 0 && (
          <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-md px-4 py-2 text-sm">
            <span className="text-foreground font-medium">
              {selection.length} {selection.length > 1 ? t("crud.bulk.selected.plural") : t("crud.bulk.selected.one")}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelection([])}>
                {t("crud.bulk.clear")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsBulkDeleteOpen(true)}
                data-testid="button-bulk-delete"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("crud.bulk.delete")}
              </Button>
            </div>
          </div>
        )}

        {schema && (
          <SchemaTable
            schema={schema.fields}
            data={filtered}
            isLoading={isLoading || schemaLoading}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onRowClick={handleRowClick}
            selectable
            selection={selection}
            onSelectionChange={setSelection}
          />
        )}

        {!isLoading && filtered.length === 0 && data && data.length > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            {t("crud.filter.empty")}
          </p>
        )}
      </div>

      {/* Form sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="sm:max-w-[600px] overflow-y-auto w-[90vw]">
          <SheetHeader className="mb-6">
            <SheetTitle>{editing ? t("crud.editTitle") : t("crud.newTitle")}</SheetTitle>
            <SheetDescription>
              {editing ? t("crud.editDesc") : t("crud.newDesc")}
            </SheetDescription>
          </SheetHeader>
          {schema && (
            <SchemaForm
              schema={schema.fields}
              defaultValues={editDefaults}
              onSubmit={onSubmit}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Detail sheet */}
      {schema && (
        <DetailSheet
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          item={detailItem}
          schema={schema.fields}
          titleField={schema.titleField}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Single delete */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("crud.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("crud.deleteDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("crud.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? t("crud.deleting") : t("crud.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk delete */}
      <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("crud.bulk.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("crud.bulk.deleteDesc").replace("{n}", String(selection.length))}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("crud.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-bulk-delete"
            >
              {deleteMutation.isPending ? t("crud.deleting") : t("crud.bulk.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Shell>
  );
}

export { getGetResourceSchemaQueryKey };
