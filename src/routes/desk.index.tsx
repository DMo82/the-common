import { createFileRoute, Link } from "@tanstack/react-router";
import { DeskFrame } from "@/components/desk/DeskFrame";

export const Route = createFileRoute("/desk/")({ component: DeskHome });

function DeskHome() {
  return (
    <DeskFrame>
      <div className="grid gap-4">
        <h1 className="text-2xl font-bold text-[#102820]">Today</h1>
        <p className="text-sm text-[#5C6F64]">Your overview for today.</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">Waiting</p>
            <p className="mt-1 text-2xl font-bold text-[#102820]">12</p>
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">Overdue</p>
            <p className="mt-1 text-2xl font-bold text-[#8A1C1C]">3</p>
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">Approved today</p>
            <p className="mt-1 text-2xl font-bold text-[#306830]">8</p>
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">Open cases</p>
            <p className="mt-1 text-2xl font-bold text-[#102820]">2</p>
          </div>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Quick links</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/desk/queues" className="rounded-lg border border-[#E8EDE9] px-3 py-2 text-sm hover:bg-[#E8EDE9]">Queues</Link>
            <Link to="/desk/safeguarding" className="rounded-lg border border-[#E8EDE9] px-3 py-2 text-sm hover:bg-[#E8EDE9]">Safety</Link>
            <Link to="/desk/users" className="rounded-lg border border-[#E8EDE9] px-3 py-2 text-sm hover:bg-[#E8EDE9]">People</Link>
            <Link to="/desk/revenue" className="rounded-lg border border-[#E8EDE9] px-3 py-2 text-sm hover:bg-[#E8EDE9]">Money</Link>
          </div>
        </div>
      </div>
    </DeskFrame>
  );
}
