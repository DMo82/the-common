import { createServerFn } from "@tanstack/react-start";

type DraftInput = {
  kind: "business" | "event";
  name: string;
  notes: string;
  when?: string;
  place?: string;
};

export const draftCopy = createServerFn({ method: "POST" })
  .inputValidator((input: DraftInput) => input)
  .handler(async ({ data }) => {
    const kind = data.kind === "event" ? "event" : "business";
    const name = String(data.name || "").trim().slice(0, 80);
    const notes = String(data.notes || "").trim().slice(0, 1200);
    const when = String(data.when || "").trim().slice(0, 80);
    const place = String(data.place || "").trim().slice(0, 180);
    if (!name && !notes) return { ok: false as const, text: "", error: "Add a name, or a few words, first." };

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, text: "", error: "Writing help is not available just now." };

    const limit = kind === "business" ? 700 : 500;
    const prompt = [
      "You help a local business write a public description for The Common, a Lambeth neighbourhood app.",
      "Tone: warm, clear, plain English. No hype, no exclamation marks, no hashtags, no emoji.",
      "Use only the facts given. Do not invent prices, awards, hours, capacity or claims.",
      "If the notes are thin, write a short honest starter from the name and say only what is known.",
      kind === "business"
        ? `Write one paragraph under ${limit} characters about what a neighbour can expect at this business.`
        : `Write one paragraph under ${limit} characters about this event: what it is, who it is for, and the time and place if they were given.`,
      "Return only the paragraph.",
      `Name: ${name || "Not given"}`,
      when ? `When: ${when}` : "",
      place ? `Place: ${place}` : "",
      `Notes: ${notes || "None yet."}`,
    ].filter(Boolean).join("\n");

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 220,
        temperature: 0.4,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return { ok: false as const, text: "", error: "The writing help could not finish. Try again." };
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = String(body.choices?.[0]?.message?.content || "").replace(/^["']|["']$/g, "").trim().slice(0, limit);
    if (!text) return { ok: false as const, text: "", error: "Nothing came back. Try again with a few more words." };
    return { ok: true as const, text, error: "" };
  });

export const ensurePicture = createServerFn({ method: "POST" })
  .inputValidator((input: { title: string; notes?: string; kind: "business" | "event" | "news" }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    const title = String(data.title || "").trim().slice(0, 120);
    if (!apiKey || !title) return { ok: false as const, url: "" };
    const notes = String(data.notes || "").trim().slice(0, 240);
    const res = await fetch("https://api.x.ai/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "grok-imagine-image",
        prompt: `A realistic photograph for a local London listing. No text, no logo, no watermark. Subject: ${data.kind}. ${title}. ${notes}`,
        n: 1,
        response_format: "b64_json",
      }),
    });
    if (!res.ok) return { ok: false as const, url: "" };
    const body = (await res.json()) as { data?: { b64_json?: string }[] };
    const b64 = body.data?.[0]?.b64_json;
    if (!b64) return { ok: false as const, url: "" };
    return { ok: true as const, url: `data:image/jpeg;base64,${b64}` };
  });
