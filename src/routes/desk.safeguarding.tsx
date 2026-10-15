import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DeskDenied, DeskLocked, deskAllows, useDeskSeat } from "@/components/desk/DeskFrame";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/desk/safeguarding")({ component: SafeguardingDesk });

function SafeguardingDesk() {
  const { seat, ready } = useDeskSeat();
  const reports = useCommon((state) => state.reports);
  const messageReports = useCommon((state) => state.messageReports ?? []);
  const businesses = useCommon((state) => state.businesses);
  const ageDeclarations = useCommon((state) => state.ageDeclarations ?? []);
  const closeReport = useCommon((state) => state.closeReport);
  const updateCase = useCommon((state) => state.updateCase);
  const settleAppeal = useCommon((state) => state.settleAppeal);
  const flagAge = useCommon((state) => state.flagAge);
  const confirmAdult = useCommon((state) => state.confirmAdult);
  const removeAgeAccount = useCommon((state) => state.removeAgeAccount);
  const reviewReport = useCommon((state) => state.reviewReport);
  const watch = useCommon((state) => state.watch);
  const [openCase, setOpenCase] = useState("");
  const [note, setNote] = useState("");
  const [ageQuery, setAgeQuery] = useState("");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  if (!ready) return <p className="p-6 text-sm text-muted">Loading safeguarding.</p>;
  if (!seat) return <DeskLocked />;
  if (!deskAllows(seat, "admin")) return <DeskDenied />;

  const harm = reports.filter((row) => row.status === "open");
  const appeals = businesses.filter((row) => row.appeal === "waiting");
  const actor = seat.email;
  function act(label: string, run: () => void) {
    run();
    setNote(`${label}. Recorded in the audit log.`);
    setOpenCase("");
  }

  function reveal(id: string) {
    setRevealed((prev) => ({ ...prev, [id]: true }));
    setNote(`Identity revealed for case ${id}. Logged.`);
  }

  const [tab, setTab] = useState<"cases" | "frozen" | "age" | "verification">("cases");
  return (
    <div className="mx-auto grid max-w-3xl gap-3">
      <h1 className="font-serif text-3xl text-deep">Safety</h1>
      <div className="flex gap-1">
        {(["cases", "frozen", "age", "verification"] as const).map((t) => (
          <button key={t} type="button" className={`rounded-full px-3 py-1 text-xs font-medium ${tab === t ? "bg-[#003820] text-white" : "border border-[#E8EDE9] bg-white"}`} onClick={() => setTab(t)}>{t === "cases" ? "Cases" : t === "frozen" ? "Frozen threads" : "Age declarations"}</button>
        ))}
      </div>
      {tab === "cases" ? (
        <div className="grid gap-2">
          {harm.map((row) => {
            const masked = !revealed[row.id];
            const due = row.updatedAt ? new Date(Date.parse(row.updatedAt) + 48 * 36e5) : new Date(Date.now() + 48 * 36e5);
            const left = Math.max(0, Math.round((due.getTime() - Date.now()) / 36e5));
            return (
              <article key={row.id} className="rounded-xl border border-line p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted">{row.category || "Report"} · {row.severity || "medium"}</p>
                    <h3 className="font-medium">{masked ? "Identity masked" : row.from}</h3>
                    <p className="text-xs text-muted">{masked ? "••••••••" : row.target}</p>
                  </div>
                  <span className={`text-xs font-semibold ${left === 0 ? "text-[#8A1C1C]" : left < 8 ? "text-[#B85C00]" : "text-muted"}`}>{left === 0 ? "Overdue" : `${left}h left`}</span>
                </div>
                {openCase === row.id ? (
                  <div className="mt-2 grid gap-2">
                    <p className="text-sm">{masked ? "Details hidden until identity is revealed." : row.body}</p>
                    {masked ? (
                      <button type="button" className="rounded-full border border-[#8A1C1C] px-3 py-1 text-xs font-medium text-[#8A1C1C]" onClick={() => reveal(row.id)}>Reveal identity</button>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {["Report to authorities", "Add to watch list", "Remove from app", "Ignore"].map((action) => (
                          <button key={action} type="button" className={`rounded-full px-3 py-1 text-xs ${action === "Remove from app" ? "bg-red-600 text-white" : "border border-line"}`} onClick={() => act(action, () => {
                            if (action === "Add to watch list") watch(row.from, "Safeguarding case");
                            else if (action === "Remove from app") closeReport(row.id, action, actor);
                            else if (action === "Report to authorities") flagAge(row.id, action);
                            else closeReport(row.id, action, actor);
                          })}>{action}</button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button type="button" className="mt-2 text-xs text-[#003820]" onClick={() => setOpenCase(row.id)}>Open case</button>
                )}
              </article>
            );
          })}
          {harm.length === 0 ? <p className="text-sm text-muted">No open cases.</p> : null}
        </div>
      ) : tab === "frozen" ? (
        <div className="grid gap-2">
          {messageReports.filter((r) => r.status === "open").map((row) => (
            <article key={row.id} className="rounded-xl border border-line p-3">
              <p className="text-xs text-muted">{row.at.slice(0, 16).replace("T", " ")}</p>
              <h3 className="font-medium">{revealed[row.id] ? row.from : "Identity masked"}</h3>
              <p className="text-sm text-muted">{revealed[row.id] ? row.reason : "Message content hidden."}</p>
              {!revealed[row.id] ? (
                <button type="button" className="mt-2 rounded-full border border-[#8A1C1C] px-3 py-1 text-xs font-medium text-[#8A1C1C]" onClick={() => reveal(row.id)}>Reveal identity</button>
              ) : (
                <button type="button" className="mt-2 rounded-full border border-line px-3 py-1 text-xs" onClick={() => reviewReport(row.id)}>Mark reviewed</button>
              )}
            </article>
          ))}
          {messageReports.filter((r) => r.status === "open").length === 0 ? <p className="text-sm text-muted">No frozen threads.</p> : null}
        </div>
      ) : (
        <details className="rounded-2xl border border-line bg-white p-4">
          <summary className="cursor-pointer font-serif text-2xl text-deep">Age declarations · {ageDeclarations.length}</summary>
          <div className="mt-3 grid gap-2">
            <input value={ageQuery} onChange={(event) => setAgeQuery(event.target.value)} placeholder="Search username or user ID" className="min-h-11 rounded-xl border border-line px-3" />
            {ageDeclarations.filter((row) => !ageQuery || `${row.username} ${row.userId}`.toLowerCase().includes(ageQuery.toLowerCase())).map((row) => (
              <article key={row.id} className="rounded-xl border border-line p-3">
                <p className="text-xs text-muted">{row.at.slice(0, 16).replace("T", " ")} · {row.userId}</p>
                <h3 className="font-medium">{revealed[row.id] ? row.username : "Identity masked"}</h3>
                {!revealed[row.id] ? (
                  <button type="button" className="mt-2 rounded-full border border-[#8A1C1C] px-3 py-1 text-xs font-medium text-[#8A1C1C]" onClick={() => reveal(row.id)}>Reveal identity</button>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["Report to authorities", "Add to watch list", "Remove from app", "Ignore"].map((action) => (
                      <button key={action} type="button" className={`rounded-full px-3 py-1 text-xs ${action === "Remove from app" ? "bg-red-600 text-white" : "border border-line"}`} onClick={() => act(action, () => {
                        if (action === "Add to watch list") watch(row.username, "Age declaration");
                        else if (action === "Remove from app") removeAgeAccount(row.id, action);
                        else if (action === "Report to authorities") flagAge(row.id, action);
                        else confirmAdult(row.id, action);
                      })}>{action}</button>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </details>
      )}
      {note ? <p className="text-sm text-[#003820]">{note}</p> : null}
    </div>
  );
}
