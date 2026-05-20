import { defineConfig } from "drizzle-kit";
import path from "path";

const databaseFile = process.env.DATABASE_FILE ?? path.resolve(process.cwd(), "data", "database.sqlite");
const url = process.env.DATABASE_URL ?? `file:${databaseFile}`;
const dialect = process.env.DATABASE_URL ? "postgresql" : "sqlite";

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect,
  dbCredentials: {
    url,
  },
});
