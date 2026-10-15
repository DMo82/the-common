import { getSql } from "./db";

export async function sendAlert(type: string, message: string, userId?: string) {
  const sql = await getSql();
  await sql`INSERT INTO alerts (id, type, message, user_id, created_at) VALUES (${crypto.randomUUID()}, ${type}, ${message}, ${userId || null}, NOW())`;
}

export async function getAlerts(userId?: string) {
  const sql = await getSql();
  if (userId) return sql`SELECT * FROM alerts WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 20`;
  return sql`SELECT * FROM alerts ORDER BY created_at DESC LIMIT 20`;
}
