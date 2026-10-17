import { createFileRoute } from "@tanstack/react-router";
import { logExport } from "@/lib/analytics.server";

export const Route = createFileRoute("/api/export-log")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json();
        const result = await logExport(body.userId, body.exportType, JSON.stringify(body.filters || {}));
        return Response.json(result);
      },
    },
  },
});
