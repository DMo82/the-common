import { createFileRoute } from "@tanstack/react-router";
import { getSubscription, createTrial, updateStatus } from "@/lib/subscription.server";

export const Route = createFileRoute("/api/subscription")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const userId = url.searchParams.get("userId") || "current";
        return Response.json(await getSubscription(userId));
      },
      POST: async ({ request }) => {
        const body = await request.json();
        if (body.action === "trial") return Response.json(await createTrial(body.userId));
        if (body.action === "update") return Response.json(await updateStatus(body.userId, body.status, body.stripeId));
        return Response.json({ error: "Unknown action" }, { status: 400 });
      },
    },
  },
});
