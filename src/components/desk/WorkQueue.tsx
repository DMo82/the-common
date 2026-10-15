import { useState } from "react";
import { useCommon } from "@/lib/common/store";
import { StatusPill } from "./StatusPill";
import { useDeskSeat, deskAllows } from "./DeskFrame";

type Kind = "business" | "event" | "news" | "listing";

type QueueItem = {
  id: string;
  kind: Kind;
  title: string;
  owner: string;
  when: string;
  status: string;
  priority: "urgent" | "high" | "normal";
  due: Date;
  severity?: "low" | "medium" | "high";
};

const SLA_HOURS = 48;

function hoursLeft(due: Date) {
  return Math.max(0, Math.round((due.getTime() - Date.now()) / 36e5));
}

function dueOf(when: string) {
  const parsed = Date.parse(when);
  const base = Number.isFinite(parsed) ? parsed : Date.now();
  return new Date(base + SLA_HOURS * 36e5);
}

function priorityOf(kind: Kind, when: string): QueueItem["priority"] {
  if (kind === "event") {
    const parsed = Date.parse(when);
    if (Number.isFinite(parsed) && parsed - Date.now() < 48 * 36e5) return "urgent";
  }
  return "normal";
}

export function WorkQueue({ kind }: { kind: Kind }) {
  const businesses = useCommon((s) => s.businesses);
  const events = useCommon((s) => s.events);
  const news = useCommon((s) => s.news);
  const listings = useCommon((s) => s.listings);
  const reports = useCommon((s) => s.reports);
  const { seat } = useDeskSeat();
  const canAct = deskAllows(seat, "admin");
  const [claimed, setClaimed] = useState<Record<string, string>>({});
  const [escalated, setEscalated] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<{ id: string; action: string; by: string; at: string; role: string }[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "urgent" | "overdue" | "unassigned">("all");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [openId, setOpenId] = useState("");

  const source =
    kind === "business" ? businesses :
    kind === "event" ? events :
    kind === "news" ? news :
    listings;

  const items: QueueItem[] = source
    .filter((row) => row.status === "pending" || row.status === "changes_requested")
    .map((row) => {
      const report = reports.find((r) => r.target === row.id);
      return {
        id: row.id,
        kind,
        title: "title" in row ? row.title : "name" in row ? row.name : "Untitled",
        owner: ("ownerName" in row ? row.ownerName : "ownerEmail" in row ? row.ownerEmail : "Unknown") || "Unknown",
        when: ("when" in row ? row.when : "posted" in row ? row.posted : new Date().toISOString()) || new Date().toISOString(),
        status: row.status,
        priority: priorityOf(kind, ("when" in row ? row.when : "") || ""),
        due: dueOf(("when" in row ? row.when : new Date().toISOString()) || new Date().toISOString()),
        severity: report?.severity,
      };
    })
    .filter((item) => {
      if (query && !`${item.title} ${item.owner}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (filter === "urgent" && item.priority !== "urgent") return false;
      if (filter === "overdue" && hoursLeft(item.due) > 0) return false;
      if (filter === "unassigned" && claimed[item.id]) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.priority === "urgent" && b.priority !== "urgent") return -1;
      if (b.priority === "urgent" && a.priority !== "urgent") return 1;
      return a.due.getTime() - b.due.getTime();
    });

  const doNext = items.filter((item) => !claimed[item.id]).slice(0, 5);

  function claim(id: string) {
    if (!canAct) return;
    setClaimed((prev) => ({ ...prev, [id]: seat?.email || "You" }));
    setHistory((prev) => [{ id, action: "Claimed", by: seat?.email || "You", at: new Date().toISOString(), role: "Moderator" }, ...prev]);
  }

  function escalate(id: string) {
    if (!canAct) return;
    const current = escalated[id] || "Moderator";
    const next = current === "Moderator" ? "Safeguarding Lead" : "Super Admin";
    setEscalated((prev) => ({ ...prev, [id]: next }));
    setHistory((prev) => [{ id, action: `Escalated to ${next}`, by: seat?.email || "You", at: new Date().toISOString(), role: "Moderator" }, ...prev]);
  }

  function bulkClaim() {
    if (!canAct) return;
    const ids = Object.keys(selected).filter((id) => selected[id]);
    setClaimed((prev) => {
      const next = { ...prev };
      ids.forEach((id) => { next[id] = seat?.email || "You"; });
      return next;
    });
    setHistory((prev) => [...ids.map((id) => ({ id, action: "Bulk claimed", by: seat?.email || "You", at: new Date().toISOString(), role: "Moderator" })), ...prev]);
    setSelected({});
  }

  function decide(id: string, action: string) {
    if (!canAct) return;
    if (items.find((i) => i.id === id)?.severity === "high" && !claimed[id]) {
      setHistory((prev) => [{ id, action: "Blocked: claim high-severity first", by: seat?.email || "You", at: new Date().toISOString(), role: "Moderator" }, ...prev]);
      return;
    }
    setHistory((prev) => [{ id, action, by: seat?.email || "You", at: new Date().toISOString(), role: "Moderator" }, ...prev]);
    const next = items.find((i) => i.id !== id && !claimed[i.id]);
    if (next) setOpenId(next.id);
    else setOpenId("");
  }

  if (items.length === 0 && !query && filter === "all") {
    return (
      <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
        <p className="text-sm text-muted">No items waiting in this queue.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {doNext.length > 0 ? (
        <div className="rounded-xl border border-[#E8EDE9] bg-[#F7F4EF] p-3">
          <p className="text-xs font-semibold uppercase text-[#5C6F64]">Do next</p>
          {doNext.map((item) => (
            <button key={item.id} type="button" className="mt-1 block w-full text-left text-sm" onClick={() => setOpenId(item.id)}>
              {item.title} · {hoursLeft(item.due)}h left
            </button>
          ))}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title or owner" className="min-h-10 flex-1 rounded-xl border border-line px-3 text-sm" />
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="min-h-10 rounded-xl border border-line px-2 text-sm">
          <option value="all">All</option>
          <option value="urgent">Urgent</option>
          <option value="overdue">Overdue</option>
          <option value="unassigned">Unassigned</option>
        </select>
        {canAct && Object.values(selected).some(Boolean) ? (
          <button type="button" className="rounded-full bg-[#003820] px-3 py-1 text-xs font-medium text-white" onClick={bulkClaim}>Claim selected</button>
        ) : null}
      </div>
      {items.map((item) => {
        const left = hoursLeft(item.due);
        const overdue = left === 0 && item.due.getTime() < Date.now();
        const mine = claimed[item.id];
        const level = escalated[item.id] || "Moderator";
        const open = openId === item.id;
        const high = item.severity === "high";
        const csam = item.title.toLowerCase().includes("csam") || item.title.toLowerCase().includes("child");
        return (
          <div key={item.id} className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                {canAct ? (
                  <input type="checkbox" checked={!!selected[item.id]} onChange={(e) => setSelected((prev) => ({ ...prev, [item.id]: e.target.checked }))} className="mt-1" />
                ) : null}
                <button type="button" className="text-left" onClick={() => setOpenId(open ? "" : item.id)}>
                  <p className="font-medium text-[#102820]">{item.title}</p>
                  <p className="text-xs text-muted">{item.owner} · {item.when.slice(0, 16).replace("T", " ")}</p>
                </button>
              </div>
              <StatusPill status={item.status} />
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className={overdue ? "font-semibold text-[#8A1C1C]" : left < 8 ? "font-semibold text-[#B85C00]" : "text-muted"}>
                {overdue ? "Overdue" : `${left}h left`}
              </span>
              {item.priority === "urgent" ? <span className="rounded-full bg-[#8A1C1C] px-2 py-0.5 text-white">Urgent</span> : null}
              {high ? <span className="rounded-full bg-[#8A1C1C] px-2 py-0.5 text-white">High</span> : null}
              {csam ? <span className="rounded-full bg-[#8A1C1C] px-2 py-0.5 text-white">No preview</span> : null}
              <span className="text-muted">Escalation: {level}</span>
              {canAct ? (
                <div className="flex gap-1">
                  {mine ? (
                    <span className="text-[#003820]">Claimed</span>
                  ) : (
                    <button type="button" className="rounded-full border border-[#003820] px-3 py-1 font-medium text-[#003820]" onClick={() => claim(item.id)}>Claim</button>
                  )}
                  {level !== "Super Admin" ? (
                    <button type="button" className="rounded-full border border-[#8A1C1C] px-3 py-1 font-medium text-[#8A1C1C]" onClick={() => escalate(item.id)}>Escalate</button>
                  ) : null}
                </div>
              ) : (
                <span className="text-muted">View only</span>
              )}
            </div>
            {open && !csam ? (
              <div className="mt-3 grid gap-2 border-t border-[#E8EDE9] pt-3">
                <p className="text-sm text-muted">Checks: details accurate · evidence attached · safe and lawful · contact works · layout correct</p>
                {high && !mine ? <p className="text-xs text-[#8A1C1C]">Claim this high-severity item before deciding.</p> : null}
                {canAct ? (
                  <div className="flex gap-1">
                    <button type="button" className="rounded-full bg-[#003820] px-3 py-1 text-xs font-medium text-white" disabled={high && !mine} onClick={() => decide(item.id, "Approved")}>Approve</button>
                    <button type="button" className="rounded-full border border-[#8A1C1C] px-3 py-1 text-xs font-medium text-[#8A1C1C]" disabled={high && !mine} onClick={() => decide(item.id, "Declined")}>Decline</button>
                  </div>
                ) : null}
                {history.filter((h) => h.id === item.id).length > 0 ? (
                  <div className="text-xs text-muted">
                    {history.filter((h) => h.id === item.id).slice(0, 3).map((h, i) => (
                      <p key={i}>{h.at.slice(11, 16)} · {h.by} ({h.role}) · {h.action}</p>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
      {items.length === 0 ? <p className="text-sm text-muted">No items match this search.</p> : null}
    </div>
  );
}
