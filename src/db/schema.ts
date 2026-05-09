import {
  pgTable,
  text,
  timestamp,
  boolean,
  numeric,
  integer,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

export const statements = pgTable("statements", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  fileName: text("file_name").notNull(),
  filePath: text("file_path"), // Encrypted path or key
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, processing, completed, error
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  statementId: uuid("statement_id").references(() => statements.id),
  date: timestamp("date").notNull(),
  isin: varchar("isin", { length: 12 }),
  symbol: varchar("symbol", { length: 20 }),
  type: varchar("type", { length: 10 }).notNull(), // buy, sell
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
  tobTax: numeric("tob_tax", { precision: 15, scale: 2 }).notNull(),
  tobRate: numeric("tob_rate", { precision: 5, scale: 4 }).notNull(),
  hash: text("hash").notNull().unique(),
  isDeclared: boolean("is_declared").default(false).notNull(),
  declarationId: uuid("declaration_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const declarations = pgTable("declarations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, submitted
  reference: text("reference"), // Structured communication
  totalTax: numeric("total_tax", { precision: 15, scale: 2 }).notNull(),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
