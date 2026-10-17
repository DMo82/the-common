import { createFileRoute } from "@tanstack/react-router";
import { updateStatus } from "@/lib/subscription.server";

export const Route = createFileRoute("/api/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text();
        const sig = request.headers.get("stripe-signature");
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        
        if (!sig || !secret) {
          return Response.json({ error: "Missing signature or secret" }, { status: 400 });
        }
        
        // Verify signature (simplified - in production use stripe.webhooks.constructEvent)
        const crypto = await import("crypto");
        const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
        if (sig !== expected && !sig.includes(expected)) {
          return Response.json({ error: "Invalid signature" }, { status: 400 });
        }
        
        try {
          const event = JSON.parse(body);
          
          if (event.type === "checkout.session.completed") {
            const userId = event.data.object.metadata?.userId;
            const stripeId = event.data.object.subscription;
            if (userId) await updateStatus(userId, "active", stripeId);
          }
          
          if (event.type === "customer.subscription.deleted") {
            const userId = event.data.object.metadata?.userId;
            if (userId) await updateStatus(userId, "cancelled");
          }
          
          if (event.type === "invoice.payment_failed") {
            const userId = event.data.object.metadata?.userId;
            if (userId) await updateStatus(userId, "past_due");
          }
          
          return Response.json({ received: true });
        } catch (err) {
          return Response.json({ error: "Webhook error" }, { status: 400 });
        }
      },
    },
  },
});
