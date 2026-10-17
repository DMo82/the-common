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
      <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
        <h2 className="font-medium text-[#102820]">Reservations</h2>
        <div className="mt-2 flex h-12 items-end gap-1">
          {[40, 55, 35, 70, 50].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-[#003820]" style={{ height: `${h}%` }} />
          ))}
        </div>
        <p className="mt-1 text-xs text-[#5C6F64]">Reservations · Check-ins · No-shows</p>
      </div>
      <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
        <h2 className="font-medium text-[#102820]">Capacity fill</h2>
        <table className="mt-2 w-full text-xs">
          <thead><tr className="border-b border-[#E8EDE9]"><th className="py-1 text-left">Event</th><th className="py-1 text-left">Fill</th></tr></thead>
          <tbody>
            <tr className="border-b border-[#E8EDE9]"><td className="py-1">Jazz Night</td><td className="py-1">85%</td></tr>
            <tr className="border-b border-[#E8EDE9]"><td className="py-1">Market Day</td><td className="py-1">72%</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
