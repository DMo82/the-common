import { getSql } from "./db";

export async function runRetention() {
  const sql = await getSql();
  const [setting] = await sql`SELECT value FROM settings WHERE key = 'retention_days'`;
  const days = parseInt(setting?.value || "2190", 10);
  
  // Archive old sessions
  await sql`DELETE FROM sessions WHERE created_at < NOW() - INTERVAL '${days} days'`;
  
  // Archive old export logs
  await sql`DELETE FROM export_log WHERE created_at < NOW() - INTERVAL '${days} days'`;
  
  return { archived: true, retentionDays: days };
}
