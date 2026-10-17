import { createFileRoute } from "@tanstack/react-router";
import { getKPIs } from "@/lib/analytics.server";

export const Route = createFileRoute("/api/analytics/kpis")({
  server: {
    handlers: {
      GET: async () => Response.json(await getKPIs()),
    },
  },
});
