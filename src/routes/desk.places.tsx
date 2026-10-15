import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/desk/places")({ component: PlacesDesk });

const TABS = ["Businesses", "Events", "Services", "Areas"] as const;

function PlacesDesk() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Businesses");
  return (
    <div className="mx-auto grid max-w-3xl gap-3">
      <h1 className="font-serif text-3xl text-deep">Places</h1>
      <div className="flex gap-1">
        {TABS.map((t) => (
          <button key={t} type="button" className={`rounded-full px-3 py-1 text-xs font-medium ${tab === t ? "bg-[#003820] text-white" : "border border-[#E8EDE9] bg-white"}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
        <p className="text-sm text-muted">{tab} list is empty. Published records appear here once the WorkQueue is live.</p>
        {tab === "Events" ? <p className="mt-2 text-xs text-muted">Free events only. No price or ticket column.</p> : null}
        {tab === "Services" ? <p className="mt-2 text-xs text-muted">Police and fire cards show Locked until gates are ticked (0/10).</p> : null}
        {tab === "Areas" ? <p className="mt-2 text-xs text-muted">The 16 areas with counts.</p> : null}
      </div>
    </div>
  );
}
