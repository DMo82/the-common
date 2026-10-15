import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
export const stripe = key ? new Stripe(key, { apiVersion: "2024-06-20" }) : null;

export async function listSubscriptions() {
  if (!stripe) return [];
  const result = await stripe.subscriptions.list({ limit: 50 });
  return result.data;
}

export async function listInvoices() {
  if (!stripe) return [];
  const result = await stripe.invoices.list({ limit: 50 });
  return result.data;
}

export async function getBalance() {
  if (!stripe) return null;
  return stripe.balance.retrieve();
}
