import { FieldSchema } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { toDatetimeLocalInput } from "@/lib/format";

interface SchemaFormProps<T> {
  schema: FieldSchema[];
  defaultValues?: Partial<T>;
  onSubmit: (data: T) => void;
  isSubmitting?: boolean;
}

function buildZodSchema(schemaFields: FieldSchema[]) {
  const zSchema: Record<string, z.ZodTypeAny> = {};
  schemaFields.forEach((field) => {
    if (field.showInForm === false) return;
    let v: z.ZodTypeAny;
    switch (field.type) {
      case "number":
      case "currency":
        v = z.coerce.number();
        if (field.required) v = (v as z.ZodNumber).min(0, "Must be >= 0");
        break;
      case "integer":
        v = z.coerce.number().int();
        if (field.required) v = (v as z.ZodNumber).min(0, "Must be >= 0");
        break;
      case "boolean":
        v = z.coerce.boolean();
        break;
      case "datetime":
      case "date":
        v = z.string();
        if (field.required) v = (v as z.ZodString).min(1, "Required");
        break;
      case "select":
      case "badge":
      case "textarea":
      case "text":
      default:
        v = z.string();
        if (field.required) v = (v as z.ZodString).min(1, "Required");
        break;
    }
    if (!field.required && field.type !== "boolean") {
      v = v.optional().nullable();
    }
    zSchema[field.key] = v;
  });
  return z.object(zSchema);
}

function buildInitialValues(schemaFields: FieldSchema[], defaults?: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const f of schemaFields) {
    if (f.showInForm === false) continue;
    const provided = defaults?.[f.key];
    if (provided !== undefined && provided !== null) {
      if (f.type === "datetime") {
        out[f.key] = toDatetimeLocalInput(provided as string);
      } else if (f.type === "boolean") {
        out[f.key] = Boolean(provided);
      } else {
        out[f.key] = provided;
      }
    } else if (f.defaultValue !== undefined) {
      out[f.key] = f.defaultValue;
    } else if (f.type === "boolean") {
      out[f.key] = false;
    } else {
      out[f.key] = "";
    }
  }
  return out;
}

export function SchemaForm<T>({ schema, defaultValues, onSubmit, isSubmitting }: SchemaFormProps<T>) {
  const { t } = useI18n();
  const formSchema = buildZodSchema(schema);
  const formFields = schema.filter((f) => f.showInForm !== false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: buildInitialValues(formFields, defaultValues as Record<string, unknown> | undefined),
  });

  useEffect(() => {
    form.reset(buildInitialValues(formFields, defaultValues as Record<string, unknown> | undefined));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  function handleSubmit(data: Record<string, unknown>) {
    const out: Record<string, unknown> = { ...data };
    for (const f of formFields) {
      if (f.type === "datetime" && typeof out[f.key] === "string" && out[f.key]) {
        out[f.key] = new Date(out[f.key] as string).toISOString();
      }
    }
    onSubmit(out as T);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {formFields.map((field) => {
            const wide = field.type === "textarea" || field.key === "name";
            return (
              <FormField
                key={field.key}
                control={form.control}
                name={field.key}
                render={({ field: formField }) => (
                  <FormItem className={wide ? "md:col-span-2" : ""}>
                    <FormLabel>
                      {field.label} {field.required && <span className="text-destructive">*</span>}
                    </FormLabel>
                    <FormControl>
                      {(field.type === "select" || field.type === "badge") && field.options ? (
                        <Select
                          onValueChange={formField.onChange}
                          value={formField.value?.toString() ?? ""}
                        >
                          <SelectTrigger data-testid={`select-${field.key}`}>
                            <SelectValue placeholder={field.label} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : field.type === "textarea" ? (
                        <Textarea
                          {...formField}
                          rows={3}
                          value={formField.value ?? ""}
                          data-testid={`input-${field.key}`}
                        />
                      ) : field.type === "boolean" ? (
                        <div className="flex items-center h-10">
                          <Switch
                            checked={Boolean(formField.value)}
                            onCheckedChange={formField.onChange}
                            data-testid={`switch-${field.key}`}
                          />
                        </div>
                      ) : (
                        <div className="relative">
                          {field.prefix && (
                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">
                              {field.prefix}
                            </span>
                          )}
                          <Input
                            {...formField}
                            type={
                              field.type === "datetime"
                                ? "datetime-local"
                                : field.type === "date"
                                  ? "date"
                                  : ["number", "currency", "integer"].includes(field.type)
                                    ? "number"
                                    : "text"
                            }
                            step={field.type === "integer" ? "1" : "any"}
                            className={`${field.prefix ? "pl-7" : ""} ${field.suffix ? "pr-7" : ""}`}
                            value={formField.value ?? ""}
                            data-testid={`input-${field.key}`}
                          />
                          {field.suffix && (
                            <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">
                              {field.suffix}
                            </span>
                          )}
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          })}
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} data-testid="button-submit">
            {isSubmitting ? t("form.saving") : t("form.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
