import { createFileRoute } from "@tanstack/react-router";
import { listEvidence, addEvidence } from "@/lib/verification.server";

export const Route = createFileRoute("/api/verification")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const biz = url.searchParams.get("business");
        const rows = await listEvidence(biz || undefined);
        return Response.json(rows);
      },
      POST: async ({ request }) => {
        const { businessId, url, notes } = await request.json();
        await addEvidence(businessId, url || "", notes || "");
        return Response.json({ ok: true });
      },
    },
  },
});
