import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Locale = "fr" | "en";

type Dict = Record<string, string>;

const fr: Dict = {
  "app.name": "Atlas Admin",

  "nav.dashboard": "Tableau de bord",
  "nav.students": "Élèves",
  "nav.sessions": "Séances",
  "nav.transactions": "Opérations",
  "nav.finances": "Finances",
  "nav.goals": "Objectifs",
  "nav.catalog": "Produits",
  "nav.schema": "Schéma",
  "nav.settings": "Paramètres",

  "dashboard.title": "Tableau de bord",
  "dashboard.subtitle": "Vue d'ensemble de l'activité, des revenus et des séances.",
  "dashboard.kpi.monthIncome": "Revenus du mois",
  "dashboard.kpi.monthNet": "Net du mois",
  "dashboard.kpi.activeStudents": "Élèves actifs",
  "dashboard.kpi.upcoming": "à venir",
  "dashboard.kpi.target": "Objectif mensuel",
  "dashboard.evolution.title": "Évolution des revenus (12 mois)",
  "dashboard.evolution.desc": "Tous les revenus convertis dans la devise de base.",
  "dashboard.bySource.title": "Sources de revenus",
  "dashboard.bySource.desc": "Répartition sur les 6 derniers mois.",
  "dashboard.bySource.empty": "Aucun revenu enregistré.",
  "dashboard.recentSessions.title": "Séances récentes",
  "dashboard.recentSessions.desc": "Dernières séances enregistrées.",
  "dashboard.recentSessions.empty": "Aucune séance pour l'instant.",

  "students.title": "Élèves",
  "students.subtitle": "Gérez vos élèves, niveaux et tarifs horaires.",

  "sessions.title": "Séances",
  "sessions.subtitle": "Planifiez et facturez vos cours individuels.",
  "sessions.paid": "Payé",
  "sessions.unpaid": "À encaisser",

  "transactions.title": "Opérations",
  "transactions.subtitle": "Revenus et dépenses, toutes activités confondues.",

  "finances.title": "Finances",
  "finances.subtitle": "Vue consolidée multi-devise convertie automatiquement.",
  "finances.income": "Revenus",
  "finances.expense": "Dépenses",
  "finances.kpi.month": "Revenus du mois",
  "finances.kpi.net": "Net",
  "finances.kpi.expenses": "dépenses",
  "finances.kpi.unpaid": "Séances impayées",
  "finances.kpi.unpaidHint": "Total à encaisser",
  "finances.kpi.target": "Objectif mensuel",
  "finances.kpi.firstMonth": "Premier mois",
  "finances.kpi.vsPrev": "vs mois précédent",
  "finances.evolution.title": "Évolution",
  "finances.evolution.desc": "Revenus et dépenses convertis dans la devise de base.",
  "finances.range.6m": "6 mois",
  "finances.range.12m": "12 mois",
  "finances.range.24m": "24 mois",
  "finances.bySource.title": "Par source",
  "finances.bySource.desc": "Revenus des 6 derniers mois.",
  "finances.projection.title": "Projection",
  "finances.projection.desc": "Régression sur l'historique pour estimer les mois à venir.",
  "finances.projection.linear": "Linéaire (degré 1)",
  "finances.projection.quadratic": "Quadratique (degré 2)",
  "finances.projection.cubic": "Cubique (degré 3)",
  "finances.projection.actual": "Historique",
  "finances.projection.forecast": "Prévision",
  "finances.projection.rsq": "Qualité (R²)",
  "finances.projection.toTarget": "Mois pour atteindre l'objectif",
  "finances.projection.months": "mois",
  "finances.projection.targetLabel": "Objectif",

  "goals.title": "Objectifs & devises",
  "goals.subtitle": "Définissez votre objectif mensuel, l'allocation et les taux de change.",
  "goals.target.title": "Objectif mensuel",
  "goals.target.desc": "Objectif et règle d'allocation des revenus.",
  "goals.baseCurrency": "Devise de base",
  "goals.monthlyTarget": "Objectif mensuel",
  "goals.reinvest": "Réinvestissement",
  "goals.expense": "Dépenses",
  "goals.savings": "Épargne",
  "goals.total": "Total",
  "goals.must100": "doit faire 100%",
  "goals.toast.saved": "Objectifs enregistrés",
  "goals.toast.allocError": "L'allocation doit faire 100%",
  "goals.toast.error": "Échec de l'enregistrement",
  "goals.toast.fxSaved": "Taux mis à jour",
  "goals.fx.title": "Taux de change",
  "goals.fx.desc": "Multiplicateur pour convertir vers {base}.",
  "goals.fx.currency": "Devise",
  "goals.fx.rate": "Taux vers la base",
  "goals.fx.updated": "Mis à jour",
  "goals.fx.save": "Enregistrer",

  "products.title": "Produits",
  "products.subtitle": "Catalogue de produits numériques.",

  "crud.search": "Rechercher...",
  "crud.new": "Nouveau",
  "crud.editTitle": "Modifier",
  "crud.newTitle": "Nouvel élément",
  "crud.editDesc": "Mettez à jour les informations puis enregistrez.",
  "crud.newDesc": "Renseignez les champs ci-dessous.",
  "crud.deleteTitle": "Êtes-vous sûr ?",
  "crud.deleteDesc": "Cette action est irréversible.",
  "crud.delete": "Supprimer",
  "crud.deleting": "Suppression...",
  "crud.cancel": "Annuler",
  "crud.toast.created": "Élément créé",
  "crud.toast.updated": "Élément mis à jour",
  "crud.toast.deleted": "Élément supprimé",
  "crud.toast.errorCreate": "Échec de la création",
  "crud.toast.errorUpdate": "Échec de la mise à jour",
  "crud.toast.errorDelete": "Échec de la suppression",
  "crud.toast.bulkDeleted": "{n} élément(s) supprimé(s)",

  "crud.filter.allColumns": "Toutes les colonnes",
  "crud.filter.in": "Rechercher dans",
  "crud.filter.any": "Tous",
  "crud.filter.clear": "Réinitialiser",
  "crud.filter.empty": "Aucun résultat pour ces critères.",

  "crud.bulk.selected.one": "élément sélectionné",
  "crud.bulk.selected.plural": "éléments sélectionnés",
  "crud.bulk.clear": "Tout désélectionner",
  "crud.bulk.delete": "Supprimer la sélection",
  "crud.bulk.deleteTitle": "Supprimer plusieurs éléments ?",
  "crud.bulk.deleteDesc": "{n} élément(s) seront supprimés. Cette action est irréversible.",

  "detail.subtitle": "Toutes les informations de cet élément.",
  "detail.edit": "Modifier",
  "detail.delete": "Supprimer",

  "sync.online": "Synchronisé",
  "sync.offline": "Hors ligne",
  "sync.syncing": "Synchronisation…",
  "sync.pending.one": "action en attente",
  "sync.pending.plural": "actions en attente",
  "sync.tooltip.pending": "{n} action(s) seront envoyées dès le retour en ligne.",
  "sync.tooltip.lastSync": "Dernière synchro",
  "sync.tooltip.hint": "Cliquez pour relancer la synchronisation.",

  "goals.fx.help.title": "À quoi sert le « taux vers la base » ?",
  "goals.fx.help.body": "C'est le multiplicateur qui convertit 1 unité d'une devise étrangère vers votre devise de base. Exemple : si la base est EUR et 1 USD vaut 0,92 €, saisissez 0,92 pour USD. Toutes les statistiques (revenus, dépenses, objectif, projection) sont consolidées en utilisant ces taux. Le taux de la devise de base est toujours 1.",
  "goals.fx.example": "Exemple",
  "goals.fx.exampleText": "1 USD × 0,92 = 0,92 EUR",

  "schema.title": "Définition du schéma",
  "schema.subtitle": "Toute l'interface est pilotée par cet endpoint.",
  "schema.resource": "Ressource",
  "schema.primaryKey": "Clé primaire",
  "schema.titleField": "Champ titre",
  "schema.options": "Options",

  "settings.title": "Paramètres",
  "settings.subtitle": "Gérez vos préférences.",
  "settings.appearance": "Apparence",
  "settings.appearance.desc": "Personnalisez le rendu visuel.",
  "settings.darkMode": "Mode sombre",
  "settings.darkMode.desc": "Basculer entre clair et sombre.",
  "settings.language": "Langue",
  "settings.language.desc": "Choisissez la langue de l'interface.",
  "settings.workspace": "Espace de travail",
  "settings.workspace.desc": "Informations sur cette instance.",
  "settings.workspaceName": "Nom",
  "settings.version": "Version",
  "settings.api": "Endpoint API",
  "settings.architecture": "Architecture UI",

  "form.save": "Enregistrer",
  "form.saving": "Enregistrement...",
  "form.submit": "Enregistrer",
  "form.submitting": "Enregistrement...",

  "table.empty": "Aucune donnée.",
};

const en: Dict = {
  "app.name": "Atlas Admin",

  "nav.dashboard": "Dashboard",
  "nav.students": "Students",
  "nav.sessions": "Sessions",
  "nav.transactions": "Transactions",
  "nav.finances": "Finances",
  "nav.goals": "Goals",
  "nav.catalog": "Products",
  "nav.schema": "Schema",
  "nav.settings": "Settings",

  "dashboard.title": "Dashboard",
  "dashboard.subtitle": "Activity, revenue and sessions at a glance.",
  "dashboard.kpi.monthIncome": "Month income",
  "dashboard.kpi.monthNet": "Month net",
  "dashboard.kpi.activeStudents": "Active students",
  "dashboard.kpi.upcoming": "upcoming",
  "dashboard.kpi.target": "Monthly target",
  "dashboard.evolution.title": "Revenue evolution (12 months)",
  "dashboard.evolution.desc": "All revenue converted to base currency.",
  "dashboard.bySource.title": "Revenue sources",
  "dashboard.bySource.desc": "Breakdown over the last 6 months.",
  "dashboard.bySource.empty": "No revenue recorded yet.",
  "dashboard.recentSessions.title": "Recent sessions",
  "dashboard.recentSessions.desc": "Latest recorded lessons.",
  "dashboard.recentSessions.empty": "No sessions yet.",

  "students.title": "Students",
  "students.subtitle": "Manage your students, levels and hourly rates.",

  "sessions.title": "Sessions",
  "sessions.subtitle": "Schedule and bill your one-on-one lessons.",
  "sessions.paid": "Paid",
  "sessions.unpaid": "Unpaid",

  "transactions.title": "Transactions",
  "transactions.subtitle": "Income and expenses across all activities.",

  "finances.title": "Finances",
  "finances.subtitle": "Multi-currency view, automatically converted.",
  "finances.income": "Income",
  "finances.expense": "Expense",
  "finances.kpi.month": "Month income",
  "finances.kpi.net": "Net",
  "finances.kpi.expenses": "expenses",
  "finances.kpi.unpaid": "Unpaid sessions",
  "finances.kpi.unpaidHint": "Outstanding total",
  "finances.kpi.target": "Monthly target",
  "finances.kpi.firstMonth": "First month",
  "finances.kpi.vsPrev": "vs prev. month",
  "finances.evolution.title": "Evolution",
  "finances.evolution.desc": "Income and expenses in base currency.",
  "finances.range.6m": "6 months",
  "finances.range.12m": "12 months",
  "finances.range.24m": "24 months",
  "finances.bySource.title": "By source",
  "finances.bySource.desc": "Revenue over the last 6 months.",
  "finances.projection.title": "Projection",
  "finances.projection.desc": "Regression on history to forecast upcoming months.",
  "finances.projection.linear": "Linear (degree 1)",
  "finances.projection.quadratic": "Quadratic (degree 2)",
  "finances.projection.cubic": "Cubic (degree 3)",
  "finances.projection.actual": "History",
  "finances.projection.forecast": "Forecast",
  "finances.projection.rsq": "Fit (R²)",
  "finances.projection.toTarget": "Months to reach target",
  "finances.projection.months": "months",
  "finances.projection.targetLabel": "Target",

  "goals.title": "Goals & currencies",
  "goals.subtitle": "Set your monthly target, allocation and exchange rates.",
  "goals.target.title": "Monthly target",
  "goals.target.desc": "Target and revenue allocation rule.",
  "goals.baseCurrency": "Base currency",
  "goals.monthlyTarget": "Monthly target",
  "goals.reinvest": "Reinvest",
  "goals.expense": "Expense",
  "goals.savings": "Savings",
  "goals.total": "Total",
  "goals.must100": "must equal 100%",
  "goals.toast.saved": "Goals saved",
  "goals.toast.allocError": "Allocation must equal 100%",
  "goals.toast.error": "Failed to save",
  "goals.toast.fxSaved": "Rate updated",
  "goals.fx.title": "Exchange rates",
  "goals.fx.desc": "Multiplier to convert to {base}.",
  "goals.fx.currency": "Currency",
  "goals.fx.rate": "Rate to base",
  "goals.fx.updated": "Updated",
  "goals.fx.save": "Save",

  "products.title": "Products",
  "products.subtitle": "Digital products catalog.",

  "crud.search": "Search...",
  "crud.new": "New",
  "crud.editTitle": "Edit",
  "crud.newTitle": "New item",
  "crud.editDesc": "Update the fields below and save.",
  "crud.newDesc": "Fill in the fields below.",
  "crud.deleteTitle": "Are you sure?",
  "crud.deleteDesc": "This action cannot be undone.",
  "crud.delete": "Delete",
  "crud.deleting": "Deleting...",
  "crud.cancel": "Cancel",
  "crud.toast.created": "Item created",
  "crud.toast.updated": "Item updated",
  "crud.toast.deleted": "Item deleted",
  "crud.toast.errorCreate": "Failed to create",
  "crud.toast.errorUpdate": "Failed to update",
  "crud.toast.errorDelete": "Failed to delete",
  "crud.toast.bulkDeleted": "{n} item(s) deleted",

  "crud.filter.allColumns": "All columns",
  "crud.filter.in": "Search in",
  "crud.filter.any": "Any",
  "crud.filter.clear": "Reset",
  "crud.filter.empty": "No result for these criteria.",

  "crud.bulk.selected.one": "item selected",
  "crud.bulk.selected.plural": "items selected",
  "crud.bulk.clear": "Clear selection",
  "crud.bulk.delete": "Delete selection",
  "crud.bulk.deleteTitle": "Delete multiple items?",
  "crud.bulk.deleteDesc": "{n} item(s) will be deleted. This cannot be undone.",

  "detail.subtitle": "Full details of this record.",
  "detail.edit": "Edit",
  "detail.delete": "Delete",

  "sync.online": "Synced",
  "sync.offline": "Offline",
  "sync.syncing": "Syncing…",
  "sync.pending.one": "pending action",
  "sync.pending.plural": "pending actions",
  "sync.tooltip.pending": "{n} action(s) will be sent once back online.",
  "sync.tooltip.lastSync": "Last sync",
  "sync.tooltip.hint": "Click to retry sync now.",

  "goals.fx.help.title": "What does \"rate to base\" mean?",
  "goals.fx.help.body": "It's the multiplier that converts 1 unit of a foreign currency into your base currency. Example: if the base is EUR and 1 USD = 0.92 €, enter 0.92 for USD. All KPIs (income, expenses, goal, projection) are consolidated using these rates. The base currency itself always has a rate of 1.",
  "goals.fx.example": "Example",
  "goals.fx.exampleText": "1 USD × 0.92 = 0.92 EUR",

  "schema.title": "Schema definition",
  "schema.subtitle": "The whole UI is driven by this endpoint.",
  "schema.resource": "Resource",
  "schema.primaryKey": "Primary key",
  "schema.titleField": "Title field",
  "schema.options": "Options",

  "settings.title": "Settings",
  "settings.subtitle": "Manage your preferences.",
  "settings.appearance": "Appearance",
  "settings.appearance.desc": "Customize how the app looks.",
  "settings.darkMode": "Dark mode",
  "settings.darkMode.desc": "Switch between light and dark.",
  "settings.language": "Language",
  "settings.language.desc": "Choose the interface language.",
  "settings.workspace": "Workspace",
  "settings.workspace.desc": "Information about this instance.",
  "settings.workspaceName": "Name",
  "settings.version": "Version",
  "settings.api": "API endpoint",
  "settings.architecture": "UI architecture",

  "form.save": "Save",
  "form.saving": "Saving...",
  "form.submit": "Save",
  "form.submitting": "Saving...",

  "table.empty": "No data.",
};

const dicts: Record<Locale, Dict> = { fr, en };

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "atlas-admin-locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "fr";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "en" || stored === "fr" ? stored : "fr";
  });

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (l: Locale) => {
    window.localStorage.setItem(STORAGE_KEY, l);
    setLocaleState(l);
  };

  const t = (key: string) => dicts[locale][key] ?? key;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used inside I18nProvider");
  return ctx;
}

export function useI18n() {
  return useT();
}
