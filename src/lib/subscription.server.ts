import { getSql } from "./db";

export async function getSubscription(userId: string) {
  const sql = await getSql();
  const [sub] = await sql`SELECT * FROM subscriptions WHERE user_id = ${userId}`;
  return sub || { status: "none", trial_end: null };
}

export async function createTrial(userId: string) {
  const sql = await getSql();
  const [setting] = await sql`SELECT value FROM settings WHERE key = 'subscription_trial_days'`;
  const days = parseInt(setting?.value || "90", 10);
  const id = crypto.randomUUID();
  await sql`INSERT INTO subscriptions (id, user_id, status, trial_end) VALUES (${id}, ${userId}, 'trial', NOW() + INTERVAL '${days} days')`;
  return { id, status: "trial" };
}

export async function updateStatus(userId: string, status: string, stripeId?: string) {
  const sql = await getSql();
  if (stripeId) {
    await sql`UPDATE subscriptions SET status = ${status}, stripe_id = ${stripeId}, updated_at = NOW() WHERE user_id = ${userId}`;
  } else {
    await sql`UPDATE subscriptions SET status = ${status}, updated_at = NOW() WHERE user_id = ${userId}`;
  }
  return { updated: true };
}
