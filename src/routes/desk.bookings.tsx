import { createFileRoute } from "@tanstack/react-router";
import { DeskFrame } from "@/components/desk/DeskFrame";

export const Route = createFileRoute("/desk/bookings")({ component: BookingsDesk });

const BOOKINGS = [
  { id: "bk_1", name: "Table for 4", business: "Brew & Barrel", date: "18 Oct 19:00", status: "confirmed" },
  { id: "bk_2", name: "Hair appointment", business: "Be U Studio", date: "19 Oct 14:00", status: "pending" },
];

function BookingsDesk() {
  return (
    <DeskFrame>
      <div className="grid gap-4">
        <h1 className="text-2xl font-bold text-[#102820]">Bookings</h1>
        <div className="rounded-xl border border-[#E8EDE9] bg-white">
          {BOOKINGS.map((b) => (
            <div key={b.id} className="flex items-center justify-between border-b border-[#E8EDE9] px-4 py-3 last:border-0">
              <div>
                <p className="font-medium text-[#102820]">{b.name}</p>
                <p className="text-xs text-[#5C6F64]">{b.business} · {b.date}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${b.status === "confirmed" ? "bg-[#E5F3E8] text-[#306830]" : "bg-[#FFE9D1] text-[#7A3E00]"}`}>{b.status}</span>
            </div>
          ))}
        </div>
      </div>
    </DeskFrame>
  );
}
