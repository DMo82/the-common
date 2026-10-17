import { createFileRoute } from "@tanstack/react-router";
import { DeskFrame } from "@/components/desk/DeskFrame";

export const Route = createFileRoute("/desk/analytics")({ component: AnalyticsDesk });

function AnalyticsDesk() {
  return (
    <DeskFrame>
      <div className="grid gap-4">
        <h1 className="text-2xl font-bold text-[#102820]">Analytics</h1>
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
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">SLA health</h2>
          <p className="mt-2 text-sm text-[#5C6F64]">92% of items within SLA</p>
        </div>
      </div>
    </DeskFrame>
  );
}
