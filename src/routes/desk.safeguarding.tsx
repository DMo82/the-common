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

  return (
    <div className="mx-auto grid max-w-3xl gap-3">
      <h1 className="font-serif text-3xl text-deep">Moderation and safeguarding</h1>
      {note ? <p className="text-sm text-muted">{note}</p> : null}

      <details className="rounded-2xl border border-line bg-white p-4">
        <summary className="cursor-pointer font-serif text-2xl text-deep">Safeguarding · {harm.length} open</summary>
        <div className="mt-3 grid gap-2">
          {harm.length === 0 ? <p className="text-sm text-muted">No open cases.</p> : harm.map((item) => (
            <Case key={item.id} open={openCase === item.id} onOpen={() => setOpenCase(openCase === item.id ? "" : item.id)} title={item.target} meta={`Case ${item.id.slice(0, 8)} · ${item.severity || "medium"}`} detail={item.body} onAction={(action) => act(action, () => {
              if (action === "Add to watch list") watch(item.target, item.body);
              else updateCase(item.id, { outcome: action, notes: action });
              if (action === "Remove from app" || action === "Ignore" || action === "Report to authorities") closeReport(item.id, action, actor);
            })} />
          ))}
        </div>
      </details>

      <details className="rounded-2xl border border-line bg-white p-4">
        <summary className="cursor-pointer font-serif text-2xl text-deep">Age declarations · {ageDeclarations.length}</summary>
        <div className="mt-3 grid gap-2">
          <input value={ageQuery} onChange={(event) => setAgeQuery(event.target.value)} placeholder="Search username or user ID" className="min-h-11 rounded-xl border border-line px-3" />
          {ageDeclarations.filter((row) => !ageQuery || `${row.username} ${row.userId}`.toLowerCase().includes(ageQuery.toLowerCase())).map((row) => (
            <Case key={row.id} open={openCase === row.id} onOpen={() => setOpenCase(openCase === row.id ? "" : row.id)} title={row.username} meta={`${row.at.slice(0, 16).replace("T", " ")} · ${row.userId} · ${row.role} · ${row.status}`} detail={`${row.type} · ${row.terms}`} onAction={(action) => act(action, () => {
              if (action === "Add to watch list") watch(row.username, "Age declaration");
              else if (action === "Remove from app") removeAgeAccount(row.id, action);
              else if (action === "Report to authorities") flagAge(row.id, action);
              else confirmAdult(row.id, action);
            })} />
          ))}
        </div>
      </details>

      <details className="rounded-2xl border border-line bg-white p-4">
        <summary className="cursor-pointer font-serif text-2xl text-deep">Appeals · {appeals.length}</summary>
        <div className="mt-3 grid gap-2">
          {appeals.length === 0 ? <p className="text-sm text-muted">No appeals waiting.</p> : appeals.map((row) => (
            <Case key={row.id} open={openCase === row.id} onOpen={() => setOpenCase(openCase === row.id ? "" : row.id)} title={row.name} meta="Appeal waiting" detail={row.reason || "No reason stored."} onAction={(action) => act(action, () => {
              if (action === "Add to watch list") watch(row.name, row.reason || "Appeal");
              else settleAppeal(row.id, action === "Ignore" ? "sent_back" : "upheld", actor);
            })} />
          ))}
        </div>
      </details>

      <details className="rounded-2xl border border-line bg-white p-4">
        <summary className="cursor-pointer font-serif text-2xl text-deep">Content escalation cases · {messageReports.length}</summary>
        <div className="mt-3 grid gap-2">
          {messageReports.length === 0 ? <p className="text-sm text-muted">No content has been escalated.</p> : messageReports.map((row) => (
            <Case key={row.id} open={openCase === row.id} onOpen={() => setOpenCase(openCase === row.id ? "" : row.id)} title={row.target} meta={`${row.from} · ${row.status}`} detail={row.reason} onAction={(action) => act(action, () => {
              if (action === "Add to watch list") watch(row.target, row.reason);
              reviewReport(row.id);
            })} />
          ))}
        </div>
      </details>
    </div>
  );
}

function Case({ open, onOpen, title, meta, detail, onAction }: { open: boolean; onOpen: () => void; title: string; meta: string; detail: string; onAction: (action: string) => void }) {
  return (
    <article className="rounded-xl border border-line p-3">
      <button type="button" className="block w-full text-left" onClick={onOpen}>
        <p className="text-xs text-muted">{meta}</p>
        <h3 className="font-medium">{title}</h3>
      </button>
      {open ? (
        <div className="mt-2 grid gap-2">
          <p className="text-sm">{detail}</p>
          <div className="flex flex-wrap gap-2">
            {["Report to authorities", "Add to watch list", "Remove from app", "Ignore"].map((action) => (
              <button key={action} type="button" className={`rounded-full px-3 py-1 text-xs ${action === "Remove from app" ? "bg-red-600 text-white" : "border border-line"}`} onClick={() => onAction(action)}>{action}</button>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
