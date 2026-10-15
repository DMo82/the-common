import { getSql } from "./db";

export async function getCounts() {
  const sql = await getSql();
  const [pending] = await sql`SELECT COUNT(*)::int AS n FROM work_item WHERE status IN ('new', 'claimed', 'in_review')`;
  const [appeals] = await sql`SELECT COUNT(*)::int AS n FROM appeals WHERE status = 'pending'`;
  const [audit] = await sql`SELECT COUNT(*)::int AS n FROM audit_events WHERE created_at > NOW() - INTERVAL '24 hours'`;
  return { pending: pending?.n || 0, appeals: appeals?.n || 0, auditToday: audit?.n || 0 };
}
