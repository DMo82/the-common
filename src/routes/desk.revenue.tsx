import { createFileRoute } from "@tanstack/react-router";
import { DeskFrame } from "@/components/desk/DeskFrame";

export const Route = createFileRoute("/desk/revenue")({ component: RevenueDesk });

function RevenueDesk() {
  return (
    <DeskFrame>
      <div className="grid gap-4">
        <h1 className="text-2xl font-bold text-[#102820]">Money</h1>
        <p className="rounded-lg bg-[#FFE9D1] px-3 py-2 text-sm text-[#7A3E00]">DEMO DATA – no settled payments yet</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">MRR</p>
            <p className="mt-1 text-2xl font-bold text-[#102820]">£0</p>
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
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Subscriptions</h2>
          <p className="mt-2 text-sm text-[#5C6F64]">No active subscriptions yet.</p>
        </div>
      </div>
    </DeskFrame>
  );
}
