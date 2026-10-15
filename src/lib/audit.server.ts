import { getSql } from "./db";

export async function logAction(actorId: string, action: string, resourceType: string, resourceId: string, role?: string, reason?: string) {
  const sql = await getSql();
  await sql`INSERT INTO work_history (id, item_id, action, actor_id, actor_role, reason, created_at) VALUES (${crypto.randomUUID()}, ${resourceId}, ${action}, ${actorId}, ${role || null}, ${reason || null}, NOW())`;
}

export async function listAudit(limit = 50) {
  const sql = await getSql();
  return sql`SELECT * FROM work_history ORDER BY created_at DESC LIMIT ${limit}`;
}

export async function listAuditByActor(actorId: string) {
  const sql = await getSql();
  return sql`SELECT * FROM work_history WHERE actor_id = ${actorId} ORDER BY created_at DESC`;
}
