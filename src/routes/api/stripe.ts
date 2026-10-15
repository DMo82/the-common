import { createFileRoute } from "@tanstack/react-router";
import { listSubscriptions, listInvoices, getBalance } from "@/lib/stripe.server";

export const Route = createFileRoute("/api/stripe")({
  server: {
    handlers: {
      GET: async () => {
        const [subs, invoices, balance] = await Promise.all([
          listSubscriptions(),
          listInvoices(),
          getBalance(),
        ]);
        return Response.json({ subscriptions: subs, invoices, balance });
      },
    },
  },
});
