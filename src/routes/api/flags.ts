import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";

export const Route = createFileRoute("/api/flags")({
  server: {
    handlers: {
      GET: async () => {
        const sql = await getSql();
        const rows = await sql`SELECT key, enabled, description FROM feature_flags ORDER BY key`;
        return Response.json(rows);
      },
      POST: async ({ request }) => {
        const { key, enabled } = await request.json();
        const sql = await getSql();
        await sql`UPDATE feature_flags SET enabled = ${enabled} WHERE key = ${key}`;
        return Response.json({ ok: true });
      },
    },
  },
});
