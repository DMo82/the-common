import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) return new Response("Stripe is not connected.", { status: 503 });
        const body = await request.text();
        const event = JSON.parse(body);
        if (event.type === "checkout.session.completed" && event.data?.object?.payment_status === "paid") {
          const session = event.data.object;
          return Response.json({ ok: true, session: session.id, businessId: session.metadata?.businessId || "", organiser: session.metadata?.organiser || "" });
        }
        return Response.json({ ok: true, ignored: event.type });
      },
    },
  },
});
