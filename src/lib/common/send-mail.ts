import { createServerFn } from "@tanstack/react-start";
import { readFileSync } from "node:fs";
import nodemailer from "nodemailer";
import { MAIL_ADDRESS, MAIL_FROM, MAIL_SMTP } from "@/lib/common/mail";

export const sendSupportMail = createServerFn({ method: "POST" })
  .inputValidator((input: { to: string; subject: string; text: string }) => input)
  .handler(async ({ data }) => {
    let pass = process.env.MAIL_PASSWORD;
    if (!pass) {
      try { pass = JSON.parse(readFileSync(new URL("../../../.grok/mail.json", import.meta.url), "utf8")).password; } catch { pass = ""; }
    }
    if (!pass) return { sent: false, reason: "Mailbox password is not set on the server." };
    const transport = nodemailer.createTransport({
      host: MAIL_SMTP.host,
      port: MAIL_SMTP.port,
      secure: MAIL_SMTP.secure,
      auth: { user: MAIL_SMTP.user, pass },
    });
    await transport.sendMail({ from: MAIL_FROM, to: data.to, replyTo: MAIL_ADDRESS, subject: data.subject, text: data.text });
    return { sent: true, reason: "" };
  });
