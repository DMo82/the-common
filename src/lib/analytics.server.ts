import { getSql } from "./db";

export async function getKPIs() {
  const sql = await getSql();
  const [dau] = await sql`SELECT COUNT(DISTINCT user_id)::int AS n FROM sessions WHERE created_at > NOW() - INTERVAL '1 day'`;
  const [mau] = await sql`SELECT COUNT(DISTINCT user_id)::int AS n FROM sessions WHERE created_at > NOW() - INTERVAL '30 days'`;
  return {
    dau: dau?.n || 0,
    mau: mau?.n || 0,
    topArticles: 0,
    activeCategories: 0,
  };
}

export async function getSummary() {
  const sql = await getSql();
  // Placeholder until users/businesses/events/listings tables exist
  return {
    users: { total: 0, byNeighbourhood: {} },
    businesses: { total: 0, byNeighbourhood: {} },
    events: { total: 0, byNeighbourhood: {} },
    listings: { total: 0, byNeighbourhood: {} },
  };
}

export async function logExport(userId: string, exportType: string, filters: string) {
  const sql = await getSql();
  const id = crypto.randomUUID();
  await sql`INSERT INTO export_log (id, user_id, export_type, filters) VALUES (${id}, ${userId}, ${exportType}, ${filters})`;
  return { id };
}

export async function getSettings() {
  const sql = await getSql();
  const rows = await sql`SELECT key, value FROM settings`;
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}
