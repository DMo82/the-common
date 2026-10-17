import { createFileRoute } from "@tanstack/react-router";
import { updateStatus } from "@/lib/subscription.server";

export const Route = createFileRoute("/api/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text();
        const sig = request.headers.get("stripe-signature");
        
        // TODO: Verify signature with Stripe secret
        // const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        
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
