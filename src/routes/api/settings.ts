import { createFileRoute } from "@tanstack/react-router";
import { getSettings } from "@/lib/analytics.server";

export const Route = createFileRoute("/api/settings")({
  server: {
    handlers: {
      GET: async () => Response.json(await getSettings()),
    },
  },
});
