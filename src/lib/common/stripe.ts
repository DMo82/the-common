import { createServerFn } from "@tanstack/react-start";

const PAID_TICKETING_ENABLED = false;
const FEE_RATE = 0.1;

export const startTicketCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: { title: string; quantity: number; amount: number; successUrl: string; cancelUrl: string; organiser?: string; connectAccount?: string }) => input)
  .handler(async ({ data }) => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!PAID_TICKETING_ENABLED) return { ok: false as const, reason: "Events are free to attend. Reserve a free place instead." };
    const quantity = Math.min(8, Math.max(1, Math.round(data.quantity)));
    const amount = Math.round(data.amount);
    if (amount < 50) return { ok: false as const, reason: "The ticket price is too low for a card payment." };
    const fee = Math.round(amount * quantity * FEE_RATE);
    const body = new URLSearchParams({
      mode: "payment",
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      "line_items[0][quantity]": String(quantity),
      "line_items[0][price_data][currency]": "gbp",
      "line_items[0][price_data][unit_amount]": String(amount),
      "line_items[0][price_data][product_data][name]": data.title.slice(0, 120),
      "payment_method_types[0]": "card",
      "metadata[fee]": String(fee),
      "metadata[organiser]": data.organiser || "",
    });
    if (data.connectAccount) {
      body.set("payment_intent_data[application_fee_amount]", String(fee));
      body.set("payment_intent_data[transfer_data][destination]", data.connectAccount);
    }
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const result = await response.json();
    if (!response.ok || !result.url) return { ok: false as const, reason: result.error?.message || "Stripe did not open a payment." };
    return { ok: true as const, url: result.url as string, fee };
  });

export const confirmTicketPayment = createServerFn({ method: "POST" })
  .inputValidator((input: { sessionId: string }) => input)
  .handler(async ({ data }) => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || !data.sessionId) return { ok: false as const, reason: "No payment to confirm." };
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${data.sessionId}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const session = await response.json();
    if (!response.ok || session.payment_status !== "paid") return { ok: false as const, reason: "The payment is not confirmed." };
    return { ok: true as const, title: session.metadata?.title || "", amount: session.amount_total || 0 };
  });

export const startBusinessSubscription = createServerFn({ method: "POST" })
  .inputValidator((input: { businessId: string; email: string }) => input)
  .handler(async ({ data }) => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return { ok: false as const, reason: "Stripe is not connected yet." };
    const body = new URLSearchParams({
      mode: "subscription",
      success_url: `${process.env.APP_URL || "http://localhost:8081"}/desk/business`,
      cancel_url: `${process.env.APP_URL || "http://localhost:8081"}/desk/business`,
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": "gbp",
      "line_items[0][price_data][unit_amount]": "1000",
      "line_items[0][price_data][recurring][interval]": "month",
      "line_items[0][price_data][product_data][name]": "The Common business page",
      customer_email: data.email,
      "metadata[businessId]": data.businessId,
    });
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const result = await response.json();
    if (!response.ok || !result.url) return { ok: false as const, reason: result.error?.message || "Stripe did not open the subscription." };
    return { ok: true as const, url: result.url as string };
  });
