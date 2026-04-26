import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const studentsTable = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  level: text("level").notNull(),
  contact: text("contact"),
  hourlyRate: numeric("hourly_rate", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("EUR"),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Student = typeof studentsTable.$inferSelect;
export type InsertStudent = typeof studentsTable.$inferInsert;

export const sessionsTable = pgTable("lesson_sessions", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  studentName: text("student_name").notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  ratePerHour: numeric("rate_per_hour", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("EUR"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  paid: boolean("paid").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type LessonSession = typeof sessionsTable.$inferSelect;
export type InsertLessonSession = typeof sessionsTable.$inferInsert;

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  source: text("source").notNull(),
  category: text("category").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("EUR"),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Transaction = typeof transactionsTable.$inferSelect;
export type InsertTransaction = typeof transactionsTable.$inferInsert;

export const goalsTable = pgTable("goals", {
  id: integer("id").primaryKey(),
  baseCurrency: text("base_currency").notNull().default("EUR"),
  monthlyTarget: numeric("monthly_target", { precision: 16, scale: 2 })
    .notNull()
    .default("1000000"),
  reinvestPct: integer("reinvest_pct").notNull().default(40),
  expensePct: integer("expense_pct").notNull().default(30),
  savingsPct: integer("savings_pct").notNull().default(30),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Goals = typeof goalsTable.$inferSelect;

export const fxRatesTable = pgTable("fx_rates", {
  currency: text("currency").primaryKey(),
  rateToBase: numeric("rate_to_base", { precision: 18, scale: 8 }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type FxRate = typeof fxRatesTable.$inferSelect;
