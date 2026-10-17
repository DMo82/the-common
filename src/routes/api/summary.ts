import { createFileRoute } from "@tanstack/react-router";
import { getSummary } from "@/lib/analytics.server";

export const Route = createFileRoute("/api/summary")({
  server: {
    handlers: {
      GET: async () => Response.json(await getSummary()),
    },
  },
});
