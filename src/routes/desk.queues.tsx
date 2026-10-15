import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { WorkQueue } from "@/components/desk/WorkQueue";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/desk/queues")({
  component: Queues,
});

const tabs = ["Events", "News", "Businesses", "Marketplace"] as const;
const SLA_HOURS = 48;

function Queues() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Events");
  const businesses = useCommon((s) => s.businesses);
  const events = useCommon((s) => s.events);
  const news = useCommon((s) => s.news);
  const listings = useCommon((s) => s.listings);
  const kind = tab === "Events" ? "event" : tab === "News" ? "news" : tab === "Businesses" ? "business" : "listing";

  const pending = [...businesses, ...events, ...news, ...listings].filter((r) => r.status === "pending" || r.status === "changes_requested");
  const open = pending.length;
  const overdue = pending.filter((r) => {
    const when = "when" in r ? r.when : "posted" in r ? r.posted : "";
    const parsed = Date.parse(when || "");
    return Number.isFinite(parsed) && parsed + SLA_HOURS * 36e5 < Date.now();
  }).length;
  const dueToday = pending.filter((r) => {
    const when = "when" in r ? r.when : "posted" in r ? r.posted : "";
    const parsed = Date.parse(when || "");
    if (!Number.isFinite(parsed)) return false;
    const due = new Date(parsed + SLA_HOURS * 36e5);
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    return due >= start && due <= end;
  }).length;

  return (
    <div className="mx-auto grid max-w-5xl gap-4">
      <div>
        <h1 className="font-serif text-3xl text-deep">Queues</h1>
        <p className="mt-1 text-sm text-muted">All of Lambeth · everything waiting for a decision · oldest due first</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-3"><p className="text-xs font-semibold uppercase tracking-wide text-[#5C6F64]">Open</p><p className="mt-1 text-2xl font-bold text-[#102820]">{open}</p></div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-3"><p className="text-xs font-semibold uppercase tracking-wide text-[#5C6F64]">Overdue</p><p className="mt-1 text-2xl font-bold text-[#8A1C1C]">{overdue}</p></div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-3"><p className="text-xs font-semibold uppercase tracking-wide text-[#5C6F64]">Due today</p><p className="mt-1 text-2xl font-bold text-[#B85C00]">{dueToday}</p></div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-3"><p className="text-xs font-semibold uppercase tracking-wide text-[#5C6F64]">Unassigned</p><p className="mt-1 text-2xl font-bold text-[#102820]">{open}</p></div>
      </div>
      <div className="flex flex-wrap gap-1">
        {tabs.map((t) => (
          <button key={t} type="button" className={`rounded-full px-3 py-1 text-xs font-medium ${tab === t ? "bg-[#003820] text-white" : "border border-[#E8EDE9] bg-white"}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      <WorkQueue kind={kind} />
    </div>
  );
}
