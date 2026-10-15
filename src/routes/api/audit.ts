import { createFileRoute } from "@tanstack/react-router";
import { listAudit, listAuditByActor } from "@/lib/audit.server";

export const Route = createFileRoute("/api/audit")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const actor = url.searchParams.get("actor");
        const rows = actor ? await listAuditByActor(actor) : await listAudit();
        return Response.json(rows);
      },
    },
  },
});
