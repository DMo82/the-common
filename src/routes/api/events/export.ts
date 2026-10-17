import { createFileRoute } from "@tanstack/react-router";
import { exportEvents } from "@/lib/events.server";

export const Route = createFileRoute("/api/events/export")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const filters = {
          from: url.searchParams.get("from") || undefined,
          to: url.searchParams.get("to") || undefined,
          neighbourhood: url.searchParams.get("neighbourhood") || undefined,
        };
        const data = await exportEvents(filters);
        return Response.json(data);
      },
    },
  },
});
