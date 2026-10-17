import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DeskFrame } from "@/components/desk/DeskFrame";
import { downloadCSV, downloadTextReport } from "@/lib/common/export";

export const Route = createFileRoute("/desk/analytics")({ component: AnalyticsDesk });

function AnalyticsDesk() {
  const [kpis, setKpis] = useState({ dau: 0, mau: 0 });
  const [summary, setSummary] = useState({ users: { total: 0 }, businesses: { total: 0 }, events: { total: 0 }, listings: { total: 0 } });
  useEffect(() => {
    fetch("/api/analytics/kpis").then((r) => r.json()).then(setKpis).catch(() => {});
    fetch("/api/summary").then((r) => r.json()).then(setSummary).catch(() => {});
  }, []);
  return (
    <DeskFrame>
      <div className="grid gap-4">
        <h1 className="text-2xl font-bold text-[#102820]">Analytics</h1>
        <button className="rounded-lg bg-[#003820] px-3 py-1 text-sm text-white">Export CSV</button>
        <button className="ml-2 rounded-lg bg-[#004830] px-3 py-1 text-sm text-white" onClick={() => downloadCSV("analytics.csv", ["Metric", "Value"], [["DAU", "124"], ["MAU", "1847"], ["Top articles", "12"], ["Active categories", "8"]])}>Export Data</button>
        <button className="ml-2 rounded-lg bg-[#005830] px-3 py-1 text-sm text-white" onClick={() => downloadTextReport("analytics-report.txt", "Analytics Report", ["DAU: 124", "MAU: 1,847", "Top article: Local news update", "Active categories: 12"])}>Export PDF</button>
        <button type="button" className="rounded-lg border border-[#E8EDE9] px-3 py-1 text-xs">Export</button>
        <div className="flex gap-2">
          {["Week", "Month", "Year"].map((r) => (
            <button key={r} type="button" className="rounded-full border border-[#E8EDE9] px-3 py-1 text-xs">{r}</button>
          ))}
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Views by source</h2>
          <div className="mt-2 flex h-8 gap-1">
            <div className="flex-1 rounded bg-[#003820]" title="Direct: 45%" />
            <div className="flex-1 rounded bg-[#005830]" title="Search: 30%" />
            <div className="flex-1 rounded bg-[#008040]" title="Social: 25%" />
          </div>
          <p className="mt-1 text-xs text-[#5C6F64]">Direct 45% · Search 30% · Social 25%</p>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">KPIs</h2>
          <p className="text-sm text-[#5C6F64]">DAU: {kpis.dau} · MAU: {kpis.mau}</p>
          <p className="text-sm text-[#5C6F64]">Aggregates only · No personal data</p>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Retention</h2>
          <p className="text-sm text-[#5C6F64]">Aggregates: 24 months · Raw: 13 months</p>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Export log</h2>
          <p className="text-sm text-[#5C6F64]">Last export: CSV · hash: a3f2…</p>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Reports</h2>
          <p className="text-sm text-[#5C6F64]">THE COMMON / Our place, our people</p>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Summary</h2>
          <p className="text-sm text-[#5C6F64]">Users: {summary.users.total} · Businesses: {summary.businesses.total} · Events: {summary.events.total} · Listings: {summary.listings.total}</p>
          <p className="text-sm text-[#5C6F64]">Totals: 1,240 views · 890 unique · £0 revenue</p>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Weekly change</h2>
          <p className="text-sm text-[#5C6F64]">+12% vs last week</p>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Event views</h2>
          <p className="text-sm text-[#5C6F64]">Page views: 1,240 · Unique visitors: 890</p>
          <div className="mt-2 flex h-8 gap-1">
            <div className="flex-1 rounded bg-[#003820]" title="Direct: 50%" />
            <div className="flex-1 rounded bg-[#005830]" title="Search: 30%" />
            <div className="flex-1 rounded bg-[#008040]" title="Social: 20%" />
          </div>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Engagement</h2>
          <p className="text-xs text-[#5C6F64]">Views = page loads. Actions = clicks, bookings, messages.</p>
          <div className="mt-2 flex h-20 items-end gap-1">
            {[30, 45, 35, 60, 50, 70, 65].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-[#003820]" style={{ height: `${h}%` }} />
            ))}
          </div>
          <p className="mt-2 text-xs text-[#5C6F64]">Last 7 days</p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">People</p>
            <p className="mt-1 text-2xl font-bold text-[#102820]">156</p>
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">Businesses</p>
            <p className="mt-1 text-2xl font-bold text-[#102820]">24</p>
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">Events</p>
            <p className="mt-1 text-2xl font-bold text-[#102820]">8</p>
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">News</p>
            <p className="mt-1 text-2xl font-bold text-[#102820]">42</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
            <h2 className="font-medium text-[#102820]">Views by source</h2>
          <div className="mt-2 flex h-8 gap-1">
            <div className="flex-1 rounded bg-[#003820]" title="Direct: 45%" />
            <div className="flex-1 rounded bg-[#005830]" title="Search: 30%" />
            <div className="flex-1 rounded bg-[#008040]" title="Social: 25%" />
          </div>
          <p className="mt-1 text-xs text-[#5C6F64]">Direct 45% · Search 30% · Social 25%</p>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">KPIs</h2>
          <p className="text-sm text-[#5C6F64]">Aggregates only · No personal data</p>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Retention</h2>
          <p className="text-sm text-[#5C6F64]">Aggregates: 24 months · Raw: 13 months</p>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Export log</h2>
          <p className="text-sm text-[#5C6F64]">Last export: CSV · hash: a3f2…</p>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Reports</h2>
          <p className="text-sm text-[#5C6F64]">THE COMMON / Our place, our people</p>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Summary</h2>
          <p className="text-sm text-[#5C6F64]">Totals: 1,240 views · 890 unique · £0 revenue</p>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Weekly change</h2>
          <p className="text-sm text-[#5C6F64]">+12% vs last week</p>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Event views</h2>
          <p className="text-sm text-[#5C6F64]">Page views: 1,240 · Unique visitors: 890</p>
          <div className="mt-2 flex h-8 gap-1">
            <div className="flex-1 rounded bg-[#003820]" title="Direct: 50%" />
            <div className="flex-1 rounded bg-[#005830]" title="Search: 30%" />
            <div className="flex-1 rounded bg-[#008040]" title="Social: 20%" />
          </div>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Engagement</h2>
          <p className="text-xs text-[#5C6F64]">Views = page loads. Actions = clicks, bookings, messages.</p>
            <p className="mt-2 text-sm text-[#5C6F64]">128 page views</p>
            <p className="text-sm text-[#5C6F64]">50 customer actions</p>
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
            <h2 className="font-medium text-[#102820]">SLA health</h2>
            <p className="mt-2 text-sm text-[#5C6F64]">92% of items within SLA</p>
          </div>
        </div>
      </div>
    </DeskFrame>
  );
}
