import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/organiser")({ component: OrganiserDesk });

const TABS = ["Overview", "Events", "Messages", "Profile"] as const;

function OrganiserDesk() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  return (
    <div className="mx-auto grid max-w-3xl gap-3">
      <h1 className="font-serif text-3xl text-deep">Event organiser</h1>
      <div className="flex gap-1">
        {TABS.map((t) => (
          <button key={t} type="button" className={`rounded-full px-3 py-1 text-xs font-medium ${tab === t ? "bg-[#003820] text-white" : "border border-[#E8EDE9] bg-white"}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
        <p className="text-sm text-muted">{tab} is empty. Organiser tools appear here once the WorkQueue is live.</p>
        {tab === "Events" ? <p className="mt-2 text-xs text-muted">New event. Details, Registrations, Export entry list.</p> : null}
      </div>
    </div>
  );
}
