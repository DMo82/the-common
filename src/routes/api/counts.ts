import { createFileRoute } from "@tanstack/react-router";
import { getCounts } from "@/lib/counts.server";

export const Route = createFileRoute("/api/counts")({
  server: {
    handlers: {
      GET: async () => Response.json(await getCounts()),
    },
  },
});
