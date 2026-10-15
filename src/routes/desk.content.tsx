import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/desk/content")({ component: ContentDesk });

const TABS = ["News", "Promotions sent", "Categories"] as const;

function ContentDesk() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("News");
  return (
    <div className="mx-auto grid max-w-3xl gap-3">
      <h1 className="font-serif text-3xl text-deep">Content</h1>
      <div className="flex gap-1">
        {TABS.map((t) => (
          <button key={t} type="button" className={`rounded-full px-3 py-1 text-xs font-medium ${tab === t ? "bg-[#003820] text-white" : "border border-[#E8EDE9] bg-white"}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
        <p className="text-sm text-muted">{tab} is empty. Content appears here once the WorkQueue is live.</p>
        {tab === "Promotions sent" ? <p className="mt-2 text-xs text-muted">Read-only log. Recipient counts shown as less than k under k.</p> : null}
        {tab === "Categories" ? <p className="mt-2 text-xs text-muted">Editable taxonomy with drag reorder. Reorder writes an audit row.</p> : null}
      </div>
    </div>
  );
}
