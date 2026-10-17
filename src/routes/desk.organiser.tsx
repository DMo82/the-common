import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/desk/organiser")({ component: OrganiserDesk });

function OrganiserDesk() {
  return (
    <div className="grid gap-4 p-4">
      <h1 className="text-2xl font-bold text-[#102820]">Organiser desk</h1>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-3 text-center">
          <p className="text-xl font-semibold text-[#003820]">128</p>
          <p className="text-xs text-muted">Reservations</p>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-3 text-center">
          <p className="text-xl font-semibold text-[#003820]">96</p>
          <p className="text-xs text-muted">Check-ins</p>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-3 text-center">
          <p className="text-xl font-semibold text-[#003820]">75%</p>
          <p className="text-xs text-muted">Check-in rate</p>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-3 text-center">
          <p className="text-xl font-semibold text-[#003820]">82%</p>
          <p className="text-xs text-muted">Capacity fill</p>
        </div>
      </div>
    </div>
  );
}
