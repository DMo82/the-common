import { createFileRoute } from "@tanstack/react-router";
import { DeskFrame } from "@/components/desk/DeskFrame";

export const Route = createFileRoute("/desk/organiser")({ component: OrganiserDesk });

const EVENTS = [
  { id: "evt_1", name: "Jazz Night", date: "20 Oct", tickets: 45, capacity: 100 },
  { id: "evt_2", name: "Quiz Night", date: "22 Oct", tickets: 12, capacity: 40 },
];

function OrganiserDesk() {
  return (
    <DeskFrame>
      <div className="grid gap-4">
        <h1 className="text-2xl font-bold text-[#102820]">Organiser desk</h1>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">Events</p>
            <p className="mt-1 text-2xl font-bold text-[#102820]">{EVENTS.length}</p>
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">Tickets sold</p>
            <p className="mt-1 text-2xl font-bold text-[#102820]">{EVENTS.reduce((a, e) => a + e.tickets, 0)}</p>
          </div>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white">
          {EVENTS.map((e) => (
            <div key={e.id} className="flex items-center justify-between border-b border-[#E8EDE9] px-4 py-3 last:border-0">
              <div>
                <p className="font-medium text-[#102820]">{e.name}</p>
                <p className="text-xs text-[#5C6F64]">{e.date} · {e.tickets}/{e.capacity} tickets</p>
              </div>
              <span className="rounded-full bg-[#E5F3E8] px-2 py-0.5 text-xs font-semibold text-[#306830]">Active</span>
            </div>
          ))}
        </div>
      </div>
    </DeskFrame>
  );
}
