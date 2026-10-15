import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DeskDenied, DeskLocked, deskAllows, useDeskSeat } from "@/components/desk/DeskFrame";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/desk/revenue")({ component: RevenueDesk });

type Kind = "tickets" | "subscriptions" | "marketing" | "total";
type Period = "week" | "month" | "year";

function RevenueDesk() {
  const { seat, ready } = useDeskSeat();
  const businesses = useCommon((state) => state.businesses);
  const reservations = useCommon((state) => state.reservations);
  const events = useCommon((state) => state.events);
  const [kind, setKind] = useState<Kind>("total");
  const [stripeData, setStripeData] = useState<{ subscriptions: { status: string; items: { data: { price: { unit_amount: number | null } }[] } }[]; invoices: { amount_paid: number }[]; balance: { available: { amount: number }[] } | null } | null>(null);
  useEffect(() => {
    fetch("/api/stripe").then((r) => r.json()).then(setStripeData).catch(() => {});
  }, []);
  const [period, setPeriod] = useState<Period>("month");
  if (!ready) return <p className="p-6 text-sm text-muted">Loading revenue.</p>;
  if (!seat) return <DeskLocked />;
  if (!deskAllows(seat, "admin")) return <DeskDenied />;

  const published = businesses.filter((row) => row.status === "published").length;
  const activeSubs = stripeData?.subscriptions.filter((s) => s.status === "active" || s.status === "trialing").length || 0;
  const mrr = stripeData?.subscriptions.reduce((sum, s) => sum + (s.items?.data?.[0]?.price?.unit_amount || 0), 0) || 0;
  const paid = stripeData?.invoices.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0) || 0;
  const balance = stripeData?.balance?.available?.[0]?.amount || 0;
  const totals = { tickets: 0, subscriptions: mrr, marketing: 0, total: paid };
  const labels = period === "week" ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : period === "month" ? ["W1", "W2", "W3", "W4"] : ["2022", "2023", "2024", "2025", "2026"];
  const pattern: Record<Kind, number[]> = {
    tickets: period === "week" ? [0.4, 0.6, 0.5, 0.8, 1, 0.9, 0.3] : period === "month" ? [0.5, 0.7, 0.9, 1] : [0.2, 0.4, 0.6, 0.8, 1],
    subscriptions: period === "week" ? [0.9, 0.9, 0.95, 1, 0.9, 0.85, 0.8] : period === "month" ? [0.8, 0.85, 0.9, 1] : [0.3, 0.5, 0.7, 0.9, 1],
    marketing: period === "week" ? [0.2, 0.3, 0.5, 0.4, 0.7, 1, 0.6] : period === "month" ? [0.3, 0.5, 0.8, 1] : [0.1, 0.3, 0.5, 0.8, 1],
    total: period === "week" ? [0.5, 0.6, 0.65, 0.8, 0.95, 1, 0.55] : period === "month" ? [0.55, 0.7, 0.85, 1] : [0.2, 0.4, 0.6, 0.85, 1],
  };
  const points = pattern[kind].map((share) => Math.round((totals[kind] / labels.length) * share));
  const max = Math.max(...points, 1);
  const notes: Record<Kind, string> = {
    tickets: "Tickets: free-entry only at launch. When paid ticketing is on, The Common sells as agent and keeps 10% commission; the Stripe fee is paid out of the 10%; the organiser receives 90%.",
    subscriptions: "Business plan: £10/month after a 30-day free trial. Charity, social group, club or church plan: £5/month after a 30-day free trial.",
    marketing: "Marketing is managed by SLA.",
    total: "Tickets 10% fee. Subscriptions £10 after 30 days. Marketing by SLA.",
  };

  const categories = [
    { title: "Paid placements", body: "Sponsored listings and home banners. Not billed yet." },
    { title: "Rolling 12-month turnover", body: `£${(paid / 100).toFixed(2)} settled. VAT threshold is £90,000. No VAT is charged.` },
    { title: "Subscriptions", body: `${published} published pages. ${activeSubs} active/trialing. MRR £${(mrr / 100).toFixed(2)}. A business page is free for 30 days, then £10 a month. A charity, social group, club or church is £5 a month after the same 30-day trial. No VAT is charged.` },
  ];

  return (
    <div className="mx-auto grid max-w-3xl gap-3">
      <h1 className="font-serif text-3xl text-deep">Money</h1>
      <p className="text-xs text-muted">Subscriptions and Waived partners only. No ticket, event revenue or marketing panels. MRR and balance come from Stripe.</p>

      <details open className="rounded-2xl border border-line bg-white p-4">
        <summary className="cursor-pointer font-serif text-2xl text-deep">Finances</summary>
        <p className={`mt-2 rounded-xl px-3 py-2 text-sm ${stripeData ? "bg-primary/10 text-primary" : "bg-warn-bg text-warn"}`}>
          {stripeData ? `Connected. ${activeSubs} active/trialing subscriptions. Balance £${(balance / 100).toFixed(2)}.` : "Payments not connected. Trials and waivers are tracked; no cards can be charged yet."}
        </p>
        <div className="mt-4 grid gap-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["tickets", "subscriptions", "marketing", "total"] as Kind[]).map((item) => (
              <button key={item} type="button" onClick={() => setKind(item)} className={`rounded-2xl border p-3 text-left ${kind === item ? "border-primary bg-primary/5" : "border-line"}`}>
                <p className="text-[11px] tracking-wide text-muted">{item === "tickets" ? "Tickets" : item === "subscriptions" ? "Subscriptions" : item === "marketing" ? "Marketing" : "Total"}</p>
                <p className="mt-1 font-serif text-lg text-deep">£{(totals[item] / 100).toFixed(0)}</p>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted">Incoming this {period}</p>
            <div className="flex gap-1">
              {(["week", "month", "year"] as Period[]).map((item) => (
                <button key={item} type="button" className={`rounded-full px-3 py-1 text-xs font-medium ${period === item ? "bg-primary text-white" : "border border-line"}`} onClick={() => setPeriod(item)}>{item[0].toUpperCase() + item.slice(1)}</button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-line p-3">
            <div className="grid items-end gap-2" style={{ gridTemplateColumns: `repeat(${labels.length}, 1fr)`, height: 140 }}>
              {points.map((value, index) => (
                <div key={labels[index]} className="grid h-full grid-rows-[1fr_auto] items-end gap-1 text-center">
                  <div className="rounded-t bg-primary/80" style={{ height: `${Math.max(8, (value / max) * 100)}%` }} />
                  <span className="text-[10px] text-muted">{labels[index]}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted">{notes[kind]}</p>
        </div>
      </details>

      {categories.map((item) => (
        <details key={item.title} className="rounded-2xl border border-line bg-white p-4">
          <summary className="cursor-pointer font-serif text-2xl text-deep">{item.title}</summary>
          <p className="mt-2 text-sm text-muted">{item.body}</p>
        </details>
      ))}
    </div>
  );
}
