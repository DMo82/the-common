import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { WorkQueue } from "@/components/desk/WorkQueue";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/desk/moderator")({ component: ModeratorDesk });

const TABS = ["Queues", "Cases", "Appeals"] as const;
const KINDS = ["Events", "News", "Businesses", "Marketplace"] as const;

function ModeratorDesk() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Queues");
  const [kind, setKind] = useState<(typeof KINDS)[number]>("Events");
  const reports = useCommon((s) => s.reports);
  const businesses = useCommon((s) => s.businesses);
  const queueKind = kind === "Events" ? "event" : kind === "News" ? "news" : kind === "Businesses" ? "business" : "listing";

  const openCases = reports.filter((r) => r.status === "open");
  const [appeals, setAppeals] = useState<{ id: string; target_id: string; status: string; ack_at: string | null; final_response_at: string | null }[]>([]);
  useEffect(() => {
    fetch("/api/appeals").then((r) => r.json()).then(setAppeals).catch(() => {});
  }, []);

  return (
    <div className="mx-auto grid max-w-3xl gap-3">
      <h1 className="font-serif text-3xl text-deep">Moderator</h1>
      <p className="text-xs text-muted">Queues, cases and appeals only. No admin or super-user tools.</p>
      <div className="flex gap-1">
        {TABS.map((t) => (
          <button key={t} type="button" className={`rounded-full px-3 py-1 text-xs font-medium ${tab === t ? "bg-[#003820] text-white" : "border border-[#E8EDE9] bg-white"}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab === "Queues" ? (
        <>
          <div className="flex flex-wrap gap-1">
            {KINDS.map((k) => (
              <button key={k} type="button" className={`rounded-full px-3 py-1 text-xs font-medium ${kind === k ? "bg-[#003820] text-white" : "border border-[#E8EDE9] bg-white"}`} onClick={() => setKind(k)}>{k}</button>
            ))}
          </div>
          <WorkQueue kind={queueKind} />
        </>
      ) : tab === "Cases" ? (
        <div className="grid gap-2">
          {openCases.map((row) => (
            <article key={row.id} className="rounded-xl border border-line p-3">
              <p className="text-xs text-muted">{row.category || "Report"} · {row.severity || "medium"}</p>
              <h3 className="font-medium">{row.target}</h3>
              <p className="text-sm text-muted">{row.body.slice(0, 120)}</p>
              {row.ackAt ? <p className="mt-1 text-xs text-muted">Acknowledged {row.ackAt.slice(0, 16).replace("T", " ")}</p> : null}
              {row.finalResponseAt ? <p className="text-xs text-muted">Final response {row.finalResponseAt.slice(0, 16).replace("T", " ")}</p> : null}
            </article>
          ))}
          {openCases.length === 0 ? <p className="text-sm text-muted">No open cases.</p> : null}
        </div>
      ) : (
        <div className="grid gap-2">
          {appeals.map((row) => (
            <article key={row.id} className="rounded-xl border border-line p-3">
              <h3 className="font-medium">{row.target_id}</h3>
              <p className="text-xs text-muted">Status: {row.status}</p>
              <p className="mt-1 text-xs text-muted">Acknowledged: {row.ack_at ? row.ack_at.slice(0, 16).replace("T", " ") : "—"} · Final response: {row.final_response_at ? row.final_response_at.slice(0, 16).replace("T", " ") : "—"}</p>
            </article>
          ))}
          {appeals.length === 0 ? <p className="text-sm text-muted">No appeals waiting.</p> : null}
        </div>
      )}
    </div>
  );
}
