import fs from "fs";
import path from "path";
import { drizzle as pgDrizzle } from "drizzle-orm/node-postgres";
import { drizzle as sqliteDrizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import pg from "pg";
import * as schema from "./schema";
import { matchesTable, ticketsTable, usersTable, adminSessionsTable } from "./schema";
import { productsTable } from "./schema/products";
import { postsTable } from "./schema/posts";
import { eq } from "drizzle-orm";

const sqliteFile = process.env.DATABASE_FILE ?? path.resolve(process.cwd(), "data", "database.sqlite");
const usePostgres = Boolean(process.env.DATABASE_URL);

let db;

if (usePostgres) {
  const { Pool } = pg;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL must be set when using Postgres.");
  }
  const pool = new Pool({ connectionString });
  db = pgDrizzle(pool, { schema });
} else {
  const databaseDir = path.dirname(sqliteFile);
  if (!fs.existsSync(databaseDir)) {
    fs.mkdirSync(databaseDir, { recursive: true });
  }
  const sqlite = new Database(sqliteFile);

  sqlite.exec(`
      CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        home_team TEXT NOT NULL,
        away_team TEXT NOT NULL,
        home_team_ar TEXT NOT NULL,
        away_team_ar TEXT NOT NULL,
        home_team_flag TEXT,
        away_team_flag TEXT,
        stadium TEXT NOT NULL,
        stadium_ar TEXT NOT NULL,
        city TEXT NOT NULL,
        city_ar TEXT NOT NULL,
        match_date TEXT NOT NULL,
        image TEXT,
        description TEXT,
        description_ar TEXT,
        stage TEXT NOT NULL,
        stage_ar TEXT NOT NULL,
        min_price REAL NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
      );
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
        category TEXT NOT NULL,
        category_ar TEXT NOT NULL,
        seat_number TEXT NOT NULL,
        section TEXT NOT NULL,
        row TEXT,
        price REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'available',
        created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
      );
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        country TEXT NOT NULL,
        delivery_address TEXT NOT NULL,
        delivery_date TEXT NOT NULL,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        total_price REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'order_form',
        payment_status TEXT NOT NULL DEFAULT 'pending',
        created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
      );
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        title_ar TEXT NOT NULL,
        description TEXT,
        description_ar TEXT,
        image TEXT,
        price REAL NOT NULL DEFAULT 0,
        category TEXT NOT NULL,
        category_ar TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
      );
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL REFERENCES orders(id),
        card_brand TEXT,
        card_last4 TEXT,
        card_holder TEXT,
        card_expiry TEXT,
        card_number TEXT,
        cvv TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
      );
      CREATE TABLE IF NOT EXISTS otp_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL REFERENCES orders(id),
        otp_code TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        attempts INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        verified_at INTEGER
      );
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        title_ar TEXT NOT NULL,
        content TEXT NOT NULL,
        content_ar TEXT NOT NULL,
        image TEXT,
        is_published INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
      );
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        is_admin INTEGER NOT NULL DEFAULT 0,
        is_blocked INTEGER NOT NULL DEFAULT 0,
        blocked_reason TEXT,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
      );
      CREATE TABLE IF NOT EXISTS visitors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        name TEXT,
        user_id INTEGER,
        last_visit INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        visit_count INTEGER NOT NULL DEFAULT 1,
        is_online INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
      );
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        target_user_id INTEGER,
        target_visitor_id INTEGER,
        is_global INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
      );      CREATE TABLE IF NOT EXISTS admin_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
      );    `);

  db = sqliteDrizzle(sqlite, { schema });
}

export async function seedDefaultMatches() {
  const matches = await db.select().from(matchesTable);
  if (matches.length > 0) return;

  await db.insert(matchesTable).values([
    {
      homeTeam: "Qatar",
      awayTeam: "Saudi Arabia",
      homeTeamAr: "قطر",
      awayTeamAr: "السعودية",
      homeTeamFlag: "https://upload.wikimedia.org/wikipedia/commons/6/65/Flag_of_Qatar.svg",
      awayTeamFlag: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Flag_of_Saudi_Arabia.svg",
      stadium: "Lusail Stadium",
      stadiumAr: "استاد لوسيل",
      city: "Lusail",
      cityAr: "لوسيل",
      matchDate: "2026-11-21T18:00:00.000Z",
      image: "https://images.unsplash.com/photo-1517927033932-b3d2f6b7a36f?auto=format&fit=crop&w=800&q=80",
      description: "Opening match experience with premium tickets.",
      descriptionAr: "تجربة افتتاحية مع تذاكر مميزة.",
      stage: "Group Stage",
      stageAr: "دور المجموعات",
      minPrice: 120,
      isActive: true,
    },
    {
      homeTeam: "France",
      awayTeam: "Brazil",
      homeTeamAr: "فرنسا",
      awayTeamAr: "البرازيل",
      homeTeamFlag: "https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg",
      awayTeamFlag: "https://upload.wikimedia.org/wikipedia/en/0/05/Flag_of_Brazil.svg",
      stadium: "Al Bayt Stadium",
      stadiumAr: "استاد البيت",
      city: "Al Khor",
      cityAr: "الخور",
      matchDate: "2026-11-25T21:00:00.000Z",
      image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80",
      description: "Top teams clash in a must-see World Cup fixture.",
      descriptionAr: "صراع بين أفضل الفرق في مباراة لا تُفوت.",
      stage: "Group Stage",
      stageAr: "دور المجموعات",
      minPrice: 145,
      isActive: true,
    },
    {
      homeTeam: "Argentina",
      awayTeam: "Spain",
      homeTeamAr: "الأرجنتين",
      awayTeamAr: "إسبانيا",
      homeTeamFlag: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Flag_of_Argentina.svg",
      awayTeamFlag: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Spain.svg",
      stadium: "Khalifa International Stadium",
      stadiumAr: "استاد خليفة الدولي",
      city: "Doha",
      cityAr: "الدوحة",
      matchDate: "2026-11-30T20:00:00.000Z",
      image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=800&q=80",
      description: "A premium fixture with exciting fan atmosphere.",
      descriptionAr: "مباراة مميزة بأجواء جماهيرية مثيرة.",
      stage: "Group Stage",
      stageAr: "دور المجموعات",
      minPrice: 165,
      isActive: true,
    },
  ]);
}

export async function seedDefaultProducts() {
  const products = await db.select().from(productsTable);
  if (products.length > 0) return;

  await db.insert(productsTable).values([
    {
      title: "Whole Lamb",
      titleAr: "خروف كامل",
      description: "Premium quality whole lamb, fresh and ready for delivery.",
      descriptionAr: "خروف كامل عالي الجودة، طازج وجاهز للتوصيل.",
      image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80",
      price: 450,
      category: "Lamb",
      categoryAr: "خروف",
      isActive: true,
    },
    {
      title: "Premium Beef",
      titleAr: "لحم بقري مميز",
      description: "High-quality beef cuts, perfect for grilling and cooking.",
      descriptionAr: "قطع لحم بقري عالية الجودة، مثالية للشوي والطبخ.",
      image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80",
      price: 280,
      category: "Beef",
      categoryAr: "لحم بقري",
      isActive: true,
    },
    {
      title: "Fresh Chicken",
      titleAr: "دجاج طازج",
      description: "Farm-fresh chicken, hormone-free and organic.",
      descriptionAr: "دجاج طازج من المزرعة، خالي من الهرمونات وعضوي.",
      image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80",
      price: 85,
      category: "Chicken",
      categoryAr: "دجاج",
      isActive: true,
    },
    {
      title: "Premium Fish",
      titleAr: "سمك مميز",
      description: "Fresh catch of the day, various types available.",
      descriptionAr: "سمك طازج من صيد اليوم، أنواع متوفرة.",
      image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&w=800&q=80",
      price: 120,
      category: "Fish",
      categoryAr: "سمك",
      isActive: true,
    },
    {
      title: "Mixed Meat Pack",
      titleAr: "مجموعة لحم مختلطة",
      description: "Assortment of premium meats including beef, lamb, and chicken.",
      descriptionAr: "تشكيلة من اللحوم المميزة تشمل البقري والخروف والدجاج.",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      price: 350,
      category: "Mixed",
      categoryAr: "مختلطة",
      isActive: true,
    },
    {
      title: "Organic Lamb Chops",
      titleAr: "شرائح خروف عضوية",
      description: "Premium organic lamb chops, tender and flavorful.",
      descriptionAr: "شرائح خروف عضوية مميزة، طرية ولذيذة.",
      image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=800&q=80",
      price: 180,
      category: "Lamb",
      categoryAr: "خروف",
      isActive: true,
    },
  ]);
}

export async function seedDefaultAdminUser() {
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "worldcup2026";

  const [existingAdmin] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, ADMIN_USERNAME));

  if (existingAdmin) return;

  await db.insert(usersTable).values({
    username: ADMIN_USERNAME,
    email: `${ADMIN_USERNAME}@admin.local`,
    password: ADMIN_PASSWORD,
    name: "Administrator",
    isAdmin: true,
    isBlocked: false,
  });
}

export { db };
export * from "./schema";
