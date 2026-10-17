import { createFileRoute } from "@tanstack/react-router";
import { DeskFrame } from "@/components/desk/DeskFrame";

export const Route = createFileRoute("/desk/services")({ component: ServicesDesk });

const SERVICES = [
  { id: "svc_1", name: "Police", area: "Clapham", status: "active" },
  { id: "svc_2", name: "Fire", area: "Brixton", status: "active" },
  { id: "svc_3", name: "Hospital", area: "Streatham", status: "active" },
];

function ServicesDesk() {
  return (
    <DeskFrame>
      <div className="grid gap-4">
        <h1 className="text-2xl font-bold text-[#102820]">Services desk</h1>
        <div className="rounded-xl border border-[#E8EDE9] bg-white">
          {SERVICES.map((s) => (
            <div key={s.id} className="flex items-center justify-between border-b border-[#E8EDE9] px-4 py-3 last:border-0">
              <div>
                <p className="font-medium text-[#102820]">{s.name}</p>
                <p className="text-xs text-[#5C6F64]">{s.area}</p>
              </div>
              <span className="rounded-full bg-[#E5F3E8] px-2 py-0.5 text-xs font-semibold text-[#306830]">{s.status}</span>
            </div>
          ))}
        </div>
      </div>
    </DeskFrame>
  );
}
