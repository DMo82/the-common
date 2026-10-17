import { createFileRoute } from "@tanstack/react-router";
import { runRetention } from "@/lib/retention.server";

export const Route = createFileRoute("/api/retention")({
  server: {
    handlers: {
      POST: async () => Response.json(await runRetention()),
    },
  },
});
