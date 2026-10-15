export const MAIL_FROM = "The Common <support@thecommon.community>";
export const MAIL_ADDRESS = "support@thecommon.community";
export const MAIL_SMTP = {
  host: "smtp.livemail.co.uk",
  port: 465,
  secure: true,
  user: MAIL_ADDRESS,
};

export function weeklyDigest(input: { name: string; area: string; headlines: string[]; events: string[] }) {
  const lines = [
    `Hello ${input.name},`,
    "",
    `This is the weekly note for ${input.area}.`,
    "",
    "On the news list",
    ...input.headlines.map((row) => `- ${row}`),
    "",
    "Coming up",
    ...input.events.map((row) => `- ${row}`),
    "",
    "The Common Community",
    MAIL_ADDRESS,
  ];
  return { subject: `${input.area} this week · The Common`, text: lines.join("\n") };
}

export function eventReminder(input: { name: string; title: string; when: string; place: string }) {
  return {
    subject: `Tomorrow: ${input.title}`,
    text: [`Hello ${input.name},`, "", `${input.title} is tomorrow, ${input.when}, at ${input.place}.`, "", "The Common Community", MAIL_ADDRESS].join("\n"),
  };
}

export function resetMessage(input: { name: string; link: string }) {
  return {
    subject: "Reset your Common password",
    text: [`Hello ${input.name},`, "", "Use this link to choose a new password. It works once.", "", input.link, "", "The Common Community", MAIL_ADDRESS].join("\n"),
  };
}
