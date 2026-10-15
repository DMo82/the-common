import { createServerFn } from "@tanstack/react-start";

export const startTicketCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: { title: string; quantity: number; amount: number; successUrl: string; cancelUrl: string }) => input)
  .handler(async ({ data }) => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return { ok: false as const, reason: "Stripe is not connected yet. Add the secret key before a card can be charged." };
    const quantity = Math.min(8, Math.max(1, Math.round(data.quantity)));
    const amount = Math.round(data.amount);
    if (amount < 50) return { ok: false as const, reason: "The ticket price is too low for a card payment." };
    const body = new URLSearchParams({
      mode: "payment",
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      "line_items[0][quantity]": String(quantity),
      "line_items[0][price_data][currency]": "gbp",
      "line_items[0][price_data][unit_amount]": String(amount),
      "line_items[0][price_data][product_data][name]": data.title.slice(0, 120),
      "payment_method_types[0]": "card",
    });
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const result = await response.json();
    if (!response.ok || !result.url) return { ok: false as const, reason: result.error?.message || "Stripe did not open a payment." };
    return { ok: true as const, url: result.url as string };
  });
