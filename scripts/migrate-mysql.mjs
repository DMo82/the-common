#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl || !databaseUrl.startsWith("mysql://")) {
  console.log("[migrate-mysql] DATABASE_URL not set or not mysql — skipping.");
  process.exit(0);
}

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "migrations");

async function main() {
  const pool = mysql.createPool(databaseUrl);
  await pool.query("CREATE TABLE IF NOT EXISTS _migrations (name VARCHAR(255) PRIMARY KEY, applied_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
  const [rows] = await pool.query("SELECT name FROM _migrations");
  const applied = new Set(rows.map((r) => r.name));

  const files = (await readdir(migrationsDir)).filter((f) => f.endsWith(".sql")).sort();
  let count = 0;
  for (const name of files) {
    if (applied.has(name)) continue;
    const text = await readFile(join(migrationsDir, name), "utf8");
    const statements = text.split(";").map((s) => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      if (stmt.startsWith("--") || !stmt) continue;
      await pool.query(stmt);
    }
    await pool.query("INSERT INTO _migrations (name) VALUES (?)", [name]);
    console.log(`[migrate-mysql] applied ${name}`);
    count += 1;
  }
  console.log(count ? `[migrate-mysql] done — ${count} migration(s).` : "[migrate-mysql] up to date.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
