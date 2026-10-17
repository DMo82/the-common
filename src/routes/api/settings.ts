import { createFileRoute } from "@tanstack/react-router";
import { getSettings } from "@/lib/analytics.server";

export const Route = createFileRoute("/api/settings")({
  server: {
    handlers: {
      GET: async () => Response.json(await getSettings()),
      POST: async ({ request }) => {
        const { key, value } = await request.json();
        const sql = await getSql();
        await sql`INSERT INTO settings (key, value) VALUES (${key}, ${value}) ON CONFLICT (key) DO UPDATE SET value = ${value}`;
        return Response.json({ updated: true });
      },
    },
  },
});
