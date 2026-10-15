import { getSql } from "./db";

export async function listEvidence(businessId?: string) {
  const sql = await getSql();
  if (businessId) {
    return sql`SELECT * FROM verification_evidence WHERE business_id = ${businessId} ORDER BY submitted_at DESC`;
  }
  return sql`SELECT * FROM verification_evidence ORDER BY submitted_at DESC LIMIT 50`;
}

export async function addEvidence(businessId: string, url: string, notes: string) {
  const sql = await getSql();
  await sql`INSERT INTO verification_evidence (id, business_id, evidence_url, notes, submitted_at) VALUES (${crypto.randomUUID()}, ${businessId}, ${url}, ${notes}, NOW())`;
}
