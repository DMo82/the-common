import { getSql } from "./db";

export async function trackEvent(type: string, entity: string, entityId: string, userId?: string) {
  const sql = await getSql();
  await sql`INSERT INTO analytics_events (id, type, entity, entity_id, user_id, created_at) VALUES (${crypto.randomUUID()}, ${type}, ${entity}, ${entityId}, ${userId || null}, NOW())`;
}

export async function getEventCounts(days = 7) {
  const sql = await getSql();
  return sql`SELECT type, COUNT(*)::int AS n FROM analytics_events WHERE created_at > NOW() - INTERVAL '${days} days' GROUP BY type`;
}
