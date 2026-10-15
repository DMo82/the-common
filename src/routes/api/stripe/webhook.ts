import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";
import { logAction } from "@/lib/audit.server";

const secret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" }) : null;

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text();
        const sig = request.headers.get("stripe-signature") || "";
        if (!stripe || !secret) {
          await logAction("stripe", "webhook_received_no_secret", "webhook", "none", "System");
          return Response.json({ ok: false, reason: "Webhook secret not set" }, { status: 400 });
        }
        let event: Stripe.Event;
        try {
          event = stripe.webhooks.constructEvent(body, sig, secret);
        } catch {
          return Response.json({ ok: false, reason: "Invalid signature" }, { status: 400 });
        }
        await logAction("stripe", `webhook_${event.type}`, "webhook", event.id, "System");
        return Response.json({ ok: true, type: event.type });
      },
    },
  },
});
