import { createFileRoute } from "@tanstack/react-router";
import { sendSupportMail } from "@/lib/common/send-mail";
import { weeklyDigest } from "@/lib/common/mail";

export const Route = createFileRoute("/api/digest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => ({}));
        const { to, name, area, headlines, events } = body as { to?: string; name?: string; area?: string; headlines?: string[]; events?: string[] };
        if (!to || !name || !area) {
          return Response.json({ ok: false, reason: "Missing to, name, or area" }, { status: 400 });
        }
        const msg = weeklyDigest({ name, area, headlines: headlines ?? [], events: events ?? [] });
        const result = await sendSupportMail({ data: { to, subject: msg.subject, text: msg.text } });
        return Response.json({ ok: result.sent, reason: result.reason });
      },
    },
  },
});
