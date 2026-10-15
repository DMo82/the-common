import { getSql } from "./db";

export async function listWorkItems(kind?: string) {
  const sql = await getSql();
  if (kind) {
    return sql`SELECT * FROM work_items WHERE kind = ${kind} ORDER BY due_at ASC`;
  }
  return sql`SELECT * FROM work_items ORDER BY due_at ASC`;
}

export async function claimItem(id: string, userId: string) {
  const sql = await getSql();
  await sql`UPDATE work_items SET claimed_by = ${userId}, claimed_at = NOW() WHERE id = ${id}`;
  await sql`INSERT INTO work_history (id, item_id, action, actor_id, created_at) VALUES (${crypto.randomUUID()}, ${id}, 'claimed', ${userId}, NOW())`;
}

export async function escalateItem(id: string, userId: string, toRole: string) {
  const sql = await getSql();
  await sql`UPDATE work_items SET escalated_to = ${toRole}, escalated_at = NOW() WHERE id = ${id}`;
  await sql`INSERT INTO work_history (id, item_id, action, actor_id, actor_role, created_at) VALUES (${crypto.randomUUID()}, ${id}, 'escalated', ${userId}, ${toRole}, NOW())`;
}

export async function decideItem(id: string, userId: string, action: string, reason?: string) {
  const sql = await getSql();
  const status = action === "Approved" ? "published" : action === "Declined" ? "refused" : "changes_requested";
  await sql`UPDATE work_items SET status = ${status} WHERE id = ${id}`;
  await sql`INSERT INTO work_history (id, item_id, action, actor_id, reason, created_at) VALUES (${crypto.randomUUID()}, ${id}, ${action}, ${userId}, ${reason || null}, NOW())`;
}

export async function listAppeals() {
  const sql = await getSql();
  return sql`SELECT * FROM appeals ORDER BY created_at DESC`;
}

export async function addAppeal(targetId: string, kind: string) {
  const sql = await getSql();
  await sql`INSERT INTO appeals (id, target_id, target_kind, status, created_at) VALUES (${crypto.randomUUID()}, ${targetId}, ${kind}, 'waiting', NOW())`;
}
