import nodemailer from "nodemailer";

const to = process.argv[2];
if (!to) {
  console.error("Usage: node scripts/send-digest.mjs you@example.com");
  process.exit(1);
}
const pass = process.env.SMTP_PASS;
if (!pass) {
  console.error("SMTP_PASS is not set. The mailbox is support@thecommon.community on FastHosts. Nothing was sent.");
  process.exit(1);
}

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.fasthosts.co.uk",
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "support@thecommon.community",
    pass,
  },
});

const text = [
  "Hello,",
  "",
  "This is the weekly note for Clapham.",
  "",
  "On the news list",
  "- Bus priority plans name Acre Lane",
  "- Poetry Night at Clapham Library",
  "",
  "Coming up",
  "- Friday acoustic set",
  "- Saturday sandwich hour",
  "",
  "The Common Community",
  "support@thecommon.community",
].join("\n");

await transport.sendMail({
  from: "The Common <support@thecommon.community>",
  to,
  replyTo: "support@thecommon.community",
  subject: "Clapham this week · The Common",
  text,
});
console.log("Sent to", to);
