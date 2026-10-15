import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCommon } from "@/lib/common/store";
import { useDeskSeat, deskAllows } from "@/components/desk/DeskFrame";

export const Route = createFileRoute("/desk/settings")({ component: SettingsDesk });

const TABS = ["Feature flags", "Police & fire", "Config", "Audit log", "Chat access"] as const;

function SettingsDesk() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Audit log");
  const audit = useCommon((s) => s.audit ?? []);
  const messageLog = useCommon((s) => s.messageLog ?? []);
  const messageReports = useCommon((s) => s.messageReports ?? []);
  const { seat } = useDeskSeat();
  const canExport = seat?.role === "super";
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = audit.filter((row) => {
    if (from && row.at < from) return false;
    if (to && row.at > to) return false;
    return true;
  }).slice(0, 50);

  function exportCsv() {
    if (!canExport) return;
    const rows = [["When", "Actor", "Action", "Target", "Reason"], ...filtered.map((r) => [r.at, r.actor, r.action, r.target, r.reason || ""])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-3">
      <h1 className="font-serif text-3xl text-deep">Settings and Audit</h1>
      <div className="flex gap-1">
        {TABS.map((t) => (
          <button key={t} type="button" className={`rounded-full px-3 py-1 text-xs font-medium ${tab === t ? "bg-[#003820] text-white" : "border border-[#E8EDE9] bg-white"}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab === "Audit log" ? (
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <div className="flex flex-wrap gap-2">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="min-h-10 rounded-xl border border-line px-2 text-sm" />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="min-h-10 rounded-xl border border-line px-2 text-sm" />
            {canExport ? <button type="button" className="rounded-full bg-[#003820] px-3 py-1 text-xs font-medium text-white" onClick={exportCsv}>Export CSV</button> : <span className="text-xs text-muted">Export restricted to super user</span>}
          </div>
          <div className="mt-3 grid gap-1">
            {filtered.map((row) => (
              <p key={row.id} className="text-xs text-muted">{row.at.slice(0, 16).replace("T", " ")} · {row.actor} · {row.action} · {row.target}{row.reason ? ` · ${row.reason}` : ""}</p>
            ))}
            {filtered.length === 0 ? <p className="text-sm text-muted">No audit rows in this range.</p> : null}
          </div>
        </div>
      ) : tab === "Chat access" ? (
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <p className="text-xs font-semibold uppercase text-[#5C6F64]">Message log</p>
          {messageLog.slice(0, 20).map((row) => (
            <p key={row.id} className="mt-1 text-xs text-muted">{row.at.slice(0, 16).replace("T", " ")} · {row.actor} · {row.action} · {row.target}</p>
          ))}
          {messageLog.length === 0 ? <p className="mt-1 text-sm text-muted">No message log entries.</p> : null}
          <p className="mt-4 text-xs font-semibold uppercase text-[#5C6F64]">Reported messages</p>
          {messageReports.filter((r) => r.status === "open").slice(0, 10).map((row) => (
            <p key={row.id} className="mt-1 text-xs text-muted">{row.at.slice(0, 16).replace("T", " ")} · {row.from} · {row.reason}</p>
          ))}
          {messageReports.filter((r) => r.status === "open").length === 0 ? <p className="mt-1 text-sm text-muted">No open reports.</p> : null}
        </div>
      ) : (
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <p className="text-sm text-muted">{tab} settings appear here.</p>
        </div>
      )}
    </div>
  );
}
