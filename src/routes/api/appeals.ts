import { createFileRoute } from "@tanstack/react-router";
import { listAppeals, addAppeal } from "@/lib/workqueue.server";

export const Route = createFileRoute("/api/appeals")({
  server: {
    handlers: {
      GET: async () => {
        const rows = await listAppeals();
        return Response.json(rows);
      },
      POST: async ({ request }) => {
        const { targetId, kind } = await request.json();
        await addAppeal(targetId, kind);
        return Response.json({ ok: true });
      },
    },
  },
});
