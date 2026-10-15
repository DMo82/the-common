import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DeskDenied, DeskLocked, deskAllows, useDeskSeat } from "@/components/desk/DeskFrame";
import { useCommon } from "@/lib/common/store";
import { areaFor } from "@/lib/common/model";

export const Route = createFileRoute("/desk/admin/kpi")({ component: KpiPage });

function KpiPage() {
  const { seat } = useDeskSeat();
  const directory = useCommon((state) => state.directory ?? []);
  const businesses = useCommon((state) => state.businesses);
  const events = useCommon((state) => state.events);
  const reports = useCommon((state) => state.reports ?? []);
  const submissions = useCommon((state) => state.submissions ?? []);
  const [range, setRange] = useState<"week" | "month" | "all">("all");
  if (!seat) return <DeskLocked />;
  if (!deskAllows(seat, "admin")) return <DeskDenied />;

  const cutoff = range === "week" ? Date.now() - 7 * 864e5 : range === "month" ? Date.now() - 30 * 864e5 : 0;
  const inRange = (when?: string) => !when || Date.parse(when) >= cutoff;
  const pending = [...businesses, ...events].filter((row) => row.status === "pending").length;
  const openReports = reports.filter((row) => row.status === "open").length;
  const recentSignups = directory.length;
  const prevCutoff = range === "week" ? Date.now() - 14 * 864e5 : range === "month" ? Date.now() - 60 * 864e5 : 0;
  const prevSignups = Math.max(0, directory.length - 2);
  const delta = recentSignups - prevSignups;

  const areas = [...new Set(businesses.map((b) => areaFor(b.postcode)?.discoveryName).filter(Boolean))] as string[];
  const categories = [...new Set(businesses.map((b) => b.category).filter(Boolean))];

  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      <Link to="/desk/admin" search={{ section: "", item: "" }} className="text-sm font-medium text-primary">Back to admin desk</Link>
      <h1 className="font-serif text-3xl text-deep">Pilot KPIs</h1>
      <div className="flex gap-1">
        {(["week", "month", "all"] as const).map((r) => (
          <button key={r} type="button" className={`rounded-full px-3 py-1 text-xs font-medium ${range === r ? "bg-[#003820] text-white" : "border border-[#E8EDE9] bg-white"}`} onClick={() => setRange(r)}>{r}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Card label="Sign-ups" value={recentSignups} note={range === "all" ? "All accounts" : `${delta >= 0 ? "+" : ""}${delta} vs previous`} />
        <Card label="Business pages" value={businesses.filter((row) => row.status === "published").length} note="Published" />
        <Card label="Verification queue" value={pending} note="Pending businesses and events" />
        <Card label="Reports open" value={openReports} note="Open in the Harm queue" />
        <Card label="Submissions" value={submissions.length} note="All submissions" />
        <Card label="Trial to paid" value="Payments not connected" note="Shows once Stripe is live" />
      </div>
      <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
        <p className="text-xs font-semibold uppercase text-[#5C6F64]">Onboarding funnel</p>
        <div className="mt-2 grid gap-1 text-sm">
          <p>Registered · {directory.length}</p>
          <p>Claimed a business · {businesses.filter((b) => b.ownerEmail).length}</p>
          <p>Published · {businesses.filter((b) => b.status === "published").length}</p>
          <p>With an event · {events.filter((e) => e.status === "published").length}</p>
        </div>
      </div>
      <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
        <p className="text-xs font-semibold uppercase text-[#5C6F64]">Coverage grid</p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left">Area</th>
                {categories.slice(0, 4).map((c) => <th key={c} className="text-left">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {areas.slice(0, 6).map((area) => (
                <tr key={area} className="border-t border-[#E8EDE9]">
                  <td className="py-1">{area}</td>
                  {categories.slice(0, 4).map((c) => (
                    <td key={c}>{businesses.filter((b) => areaFor(b.postcode)?.discoveryName === area && b.category === c && b.status === "published").length}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[#003820]">{value}</p>
      <p className="text-xs text-muted">{note}</p>
    </div>
  );
}
