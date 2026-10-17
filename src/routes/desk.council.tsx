import { createFileRoute } from "@tanstack/react-router";
import { DeskFrame } from "@/components/desk/DeskFrame";

export const Route = createFileRoute("/desk/council")({ component: CouncilDesk });

function CouncilDesk() {
  return (
    <DeskFrame>
      <div className="grid gap-4">
        <h1 className="text-2xl font-bold text-[#102820]">Council briefing</h1>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">Users</p>
            <p className="mt-1 text-2xl font-bold text-[#102820]">1,240</p>
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">Businesses</p>
            <p className="mt-1 text-2xl font-bold text-[#102820]">86</p>
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">Events</p>
            <p className="mt-1 text-2xl font-bold text-[#102820]">24</p>
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">Incidents</p>
            <p className="mt-1 text-2xl font-bold text-[#102820]">3</p>
          </div>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">By neighbourhood</h2>
          <div className="mt-3 grid gap-2 text-sm">
            <div className="flex justify-between"><span>Clapham</span><span className="font-medium">420 users</span></div>
            <div className="flex justify-between"><span>Brixton</span><span className="font-medium">380 users</span></div>
            <div className="flex justify-between"><span>Streatham</span><span className="font-medium">240 users</span></div>
          </div>
        </div>
      </div>
    </DeskFrame>
  );
}
