import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DeskFrame } from "@/components/desk/DeskFrame";
import { downloadCSV, downloadTextReport } from "@/lib/common/export";

export const Route = createFileRoute("/desk/analytics")({ component: AnalyticsDesk });

function AnalyticsDesk() {
  const [kpis, setKpis] = useState({ dau: 0, mau: 0 });
  const [summary, setSummary] = useState({ users: { total: 0 }, businesses: { total: 0 }, events: { total: 0 }, listings: { total: 0 } });
  const [settings, setSettings] = useState({ subscription_price: "10", ticket_fee_percent: "10", retention_days: "2190" });

  const logExport = (type: string) => {
    fetch("/api/export-log", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: "current", exportType: type, filters: {} }) }).catch(() => {});
  };

  const updateSetting = (key: string, value: string) => {
    fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, value }) })
      .then(() => setSettings((s) => ({ ...s, [key]: value })))
      .catch(() => {});
  };

  useEffect(() => {
    fetch("/api/analytics/kpis").then((r) => r.json()).then(setKpis).catch(() => {});
    fetch("/api/summary").then((r) => r.json()).then(setSummary).catch(() => {});
    fetch("/api/settings").then((r) => r.json()).then(setSettings).catch(() => {});
  }, []);

  return (
    <DeskFrame>
      <div className="grid gap-4">
        <h1 className="text-2xl font-bold text-[#102820]">Analytics</h1>
        
        <div className="flex gap-2">
          <button className="rounded-lg bg-[#003820] px-3 py-1 text-sm text-white" onClick={() => { logExport("csv"); downloadCSV("analytics.csv", ["Metric", "Value"], [["DAU", String(kpis.dau)], ["MAU", String(kpis.mau)]]); }}>Export CSV</button>
          <button className="rounded-lg bg-[#005830] px-3 py-1 text-sm text-white" onClick={() => { logExport("pdf"); downloadTextReport("analytics-report.txt", "Analytics Report", [`DAU: ${kpis.dau}`, `MAU: ${kpis.mau}`]); }}>Export PDF</button>
        </div>

        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">KPIs</h2>
          <p className="text-sm text-[#5C6F64]">DAU: {kpis.dau} · MAU: {kpis.mau}</p>
        </div>

        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Summary</h2>
          <p className="text-sm text-[#5C6F64]">Users: {summary.users.total} · Businesses: {summary.businesses.total} · Events: {summary.events.total} · Listings: {summary.listings.total}</p>
        </div>

        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Tariffs</h2>
          <div className="mt-2 grid gap-2 text-sm">
            <label className="flex items-center gap-2">Subscription (£/month): <input type="number" value={settings.subscription_price} onChange={(e) => updateSetting("subscription_price", e.target.value)} className="w-16 rounded border px-2 py-1" /></label>
            <label className="flex items-center gap-2">Ticket fee (%): <input type="number" value={settings.ticket_fee_percent} onChange={(e) => updateSetting("ticket_fee_percent", e.target.value)} className="w-16 rounded border px-2 py-1" /></label>
            <label className="flex items-center gap-2">Retention (days): <input type="number" value={settings.retention_days} onChange={(e) => updateSetting("retention_days", e.target.value)} className="w-20 rounded border px-2 py-1" /></label>
          </div>
        </div>
      </div>
    </DeskFrame>
  );
}
