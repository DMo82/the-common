import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/desk/digest")({ component: DigestPage });

function DigestPage() {
  const [to, setTo] = useState("");
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [headlines, setHeadlines] = useState("");
  const [events, setEvents] = useState("");
  const [result, setResult] = useState("");

  async function send() {
    setResult("Sending…");
    const res = await fetch("/api/digest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to, name, area,
        headlines: headlines.split("\n").filter(Boolean),
        events: events.split("\n").filter(Boolean),
      }),
    });
    const data = await res.json();
    setResult(data.ok ? "Sent" : data.reason || "Failed");
  }

  return (
    <div className="mx-auto grid max-w-md gap-3">
      <h1 className="font-serif text-3xl text-deep">Send weekly digest</h1>
      <label className="text-sm">To<input value={to} onChange={(e) => setTo(e.target.value)} type="email" className="mt-1 w-full rounded-xl border border-line px-3 py-2" /></label>
      <label className="text-sm">Name<input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-line px-3 py-2" /></label>
      <label className="text-sm">Area<input value={area} onChange={(e) => setArea(e.target.value)} className="mt-1 w-full rounded-xl border border-line px-3 py-2" /></label>
      <label className="text-sm">Headlines (one per line)<textarea value={headlines} onChange={(e) => setHeadlines(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-line px-3 py-2" /></label>
      <label className="text-sm">Events (one per line)<textarea value={events} onChange={(e) => setEvents(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-line px-3 py-2" /></label>
      <button type="button" onClick={send} className="rounded-full bg-[#003820] px-4 py-2 text-sm font-medium text-white">Send</button>
      {result ? <p className="text-sm text-muted">{result}</p> : null}
    </div>
  );
}
