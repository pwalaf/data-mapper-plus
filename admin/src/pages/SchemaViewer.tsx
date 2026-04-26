import { Shell } from "@/components/layout/Shell";
import { useGetResourceSchema } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Database, Code2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useT } from "@/i18n/I18nProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

type Resource = "products" | "students" | "sessions" | "transactions";

export default function SchemaViewer() {
  const { t } = useT();
  const [resource, setResource] = useState<Resource>("students");
  const { data: schema, isLoading } = useGetResourceSchema(resource);

  return (
    <Shell>
      <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-medium tracking-tight flex items-center gap-3">
              <Database className="h-8 w-8 text-primary" />
              {t("schema.title")}
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">{t("schema.subtitle")}</p>
          </div>
          <Select value={resource} onValueChange={(v) => setResource(v as Resource)}>
            <SelectTrigger className="w-[220px]" data-testid="select-resource">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="students">students</SelectItem>
              <SelectItem value="sessions">sessions</SelectItem>
              <SelectItem value="transactions">transactions</SelectItem>
              <SelectItem value="products">products</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : schema ? (
          <div className="grid gap-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  {t("schema.resource")}: {schema.name}
                </CardTitle>
                <CardDescription className="text-primary/70">
                  {t("schema.primaryKey")}: <code className="bg-primary/10 px-1 py-0.5 rounded">{schema.primaryKey}</code> •{" "}
                  {t("schema.titleField")}: <code className="bg-primary/10 px-1 py-0.5 rounded">{schema.titleField}</code>
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid gap-4">
              {schema.fields.map((field, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  key={field.key}
                >
                  <Card className="hover-elevate transition-all">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-mono text-lg font-bold text-foreground">
                            {field.key}
                            {field.required && <span className="text-destructive ml-1">*</span>}
                          </h3>
                          <p className="text-muted-foreground">{field.label}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-mono text-xs font-medium">
                            type: {field.type}
                          </span>
                          {field.showInTable && (
                            <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 font-mono text-xs">
                              showInTable
                            </span>
                          )}
                          {field.showInForm && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-mono text-xs">
                              showInForm
                            </span>
                          )}
                          {field.sortable && (
                            <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 font-mono text-xs">
                              sortable
                            </span>
                          )}
                        </div>
                      </div>

                      {field.options && field.options.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                            {t("schema.options")}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {field.options.map((opt) => (
                              <div
                                key={opt.value}
                                className="flex items-center gap-2 text-sm bg-muted/50 px-2 py-1 rounded border"
                              >
                                <span className="font-mono text-xs">{opt.value}</span>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <span>{opt.label}</span>
                                {opt.tone && (
                                  <span
                                    className={`w-2 h-2 rounded-full ml-1 ${
                                      opt.tone === "success"
                                        ? "bg-emerald-500"
                                        : opt.tone === "warning"
                                          ? "bg-amber-500"
                                          : opt.tone === "danger"
                                            ? "bg-destructive"
                                            : opt.tone === "info"
                                              ? "bg-blue-500"
                                              : "bg-muted-foreground"
                                    }`}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Shell>
  );
}
