import { createFileRoute } from "@tanstack/react-router";
import { DeskFrame } from "@/components/desk/DeskFrame";

export const Route = createFileRoute("/desk/revenue")({ component: RevenueDesk });

function RevenueDesk() {
  return (
    <DeskFrame>
      <div className="grid gap-4">
        <h1 className="text-2xl font-bold text-[#102820]">Money</h1>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Cost analysis</h2>
          <p className="text-sm text-[#5C6F64]">Subscription: £10/month · Cost per view: £0.08</p>
          <div className="mt-2 h-4 rounded-full bg-[#E8EDE9]">
            <div className="h-full w-3/4 rounded-full bg-[#003820]" />
          </div>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Estimated offer value</h2>
          <p className="text-sm text-[#5C6F64]">Average spend: £25 · Estimated return: £8.50</p>
          <p className="text-xs text-[#5C6F64]">Formula: (spend × conversion) − cost. Always estimated.</p>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Offers</h2>
          <p className="text-sm text-[#5C6F64]">No active offers yet.</p>
          <button type="button" className="mt-2 rounded-lg bg-[#003820] px-3 py-1 text-xs text-white">Create offer</button>
        </div>
        <div className="flex gap-2">
          {["Week", "Month", "Year"].map((r) => (
            <button key={r} type="button" className="rounded-full border border-[#E8EDE9] px-3 py-1 text-xs">{r}</button>
          ))}
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Trend</h2>
          <div className="mt-2 flex h-16 items-end gap-1">
            {[15, 25, 20, 35, 30, 40, 45].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-[#003820]" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <p className="rounded-lg bg-[#FFE9D1] px-3 py-2 text-sm text-[#7A3E00]">DEMO DATA – no settled payments yet</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">MRR</p>
            <p className="mt-1 text-2xl font-bold text-[#102820]">£1,240</p>
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">Subscriptions</p>
            <p className="mt-1 text-2xl font-bold text-[#102820]">0</p>
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">Trials</p>
            <p className="mt-1 text-2xl font-bold text-[#102820]">0</p>
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">Failed</p>
            <p className="mt-1 text-2xl font-bold text-[#8A1C1C]">0</p>
          </div>
        </div>
        <div className="rounded-xl border border-[#FFE9D1] bg-[#FFE9D1] p-4">
          <h2 className="font-medium text-[#7A3E00]">Billing alerts</h2>
          <p className="mt-1 text-sm text-[#7A3E00]">No failed payments or expiring trials.</p>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">VAT threshold</h2>
          <p className="mt-2 text-sm text-[#5C6F64]">£1,240 of £90,000 (0%)</p>
          <div className="mt-2 h-2 rounded-full bg-[#E8EDE9]"><div className="h-2 w-0 rounded-full bg-[#306830]" /></div>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Payouts & fees</h2>
          <p className="mt-2 text-sm text-[#5C6F64]">Platform fee: 10% on tickets</p>
          <p className="text-sm text-[#5C6F64]">Subscription: £10/month after trial</p>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Refunds</h2>
          <p className="mt-2 text-sm text-[#5C6F64]">No pending refunds.</p>
          <button type="button" className="mt-2 rounded-lg border border-[#E8EDE9] px-4 py-2 text-sm">Process refund</button>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Export</h2>
          <button type="button" className="mt-2 rounded-lg border border-[#E8EDE9] px-4 py-2 text-sm" onClick={() => alert("Export started")}>Download CSV</button>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Subscriptions</h2>
          <p className="mt-2 text-sm text-[#5C6F64]">No active subscriptions yet.</p>
        </div>
      </div>
    </DeskFrame>
  );
}
