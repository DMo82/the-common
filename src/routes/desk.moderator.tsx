import { createFileRoute } from "@tanstack/react-router";
import { DeskFrame } from "@/components/desk/DeskFrame";

export const Route = createFileRoute("/desk/moderator")({ component: ModeratorDesk });

function ModeratorDesk() {
  return (
    <DeskFrame>
      <div className="grid gap-4">
        <h1 className="text-2xl font-bold text-[#102820]">Moderator</h1>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">My queue</p>
            <p className="mt-1 text-2xl font-bold text-[#102820]">5</p>
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">Unassigned</p>
            <p className="mt-1 text-2xl font-bold text-[#102820]">3</p>
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">Breaching SLA</p>
            <p className="mt-1 text-2xl font-bold text-[#8A1C1C]">1</p>
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">Urgent</p>
            <p className="mt-1 text-2xl font-bold text-[#7A3E00]">2</p>
          </div>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Do next</h2>
          <p className="mt-2 text-sm text-[#5C6F64]">Your items, oldest due first.</p>
        </div>
      </div>
    </DeskFrame>
  );
}
