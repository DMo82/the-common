import { createFileRoute } from "@tanstack/react-router";
import { listWorkItems, claimItem, escalateItem, decideItem } from "@/lib/workqueue.server";

export const Route = createFileRoute("/api/workqueue")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const kind = url.searchParams.get("kind") || undefined;
        const items = await listWorkItems(kind);
        return Response.json(items);
      },
      POST: async ({ request }) => {
        const body = await request.json();
        const { action, id, userId, reason, toRole } = body;
        if (action === "claim") await claimItem(id, userId);
        else if (action === "escalate") await escalateItem(id, userId, toRole);
        else if (action === "decide") await decideItem(id, userId, body.decision, reason);
        return Response.json({ ok: true });
      },
    },
  },
});
