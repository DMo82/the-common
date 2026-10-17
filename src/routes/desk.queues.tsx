import { createFileRoute } from "@tanstack/react-router";
import { DeskFrame } from "@/components/desk/DeskFrame";
import { StatusPill } from "@/components/desk/StatusPill";

export const Route = createFileRoute("/desk/queues")({ component: QueuesDesk });

const ITEMS = [
  { id: "biz_1", type: "Business", title: "Be U Studio", status: "pending", area: "Clapham" },
  { id: "evt_1", type: "Event", title: "Jazz Night", status: "pending", area: "Brixton" },
  { id: "lst_1", type: "Listing", title: "Bakery equipment", status: "pending", area: "Streatham" },
];

function QueuesDesk() {
  return (
    <DeskFrame>
      <div className="grid gap-4">
        <h1 className="text-2xl font-bold text-[#102820]">Queues</h1>
        <p className="text-sm text-[#5C6F64]">Items waiting for approval.</p>
        <div className="rounded-xl border border-[#E8EDE9] bg-white">
          {ITEMS.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b border-[#E8EDE9] px-4 py-3 last:border-0">
              <div>
                <p className="font-medium text-[#102820]">{item.title}</p>
                <p className="text-xs text-[#5C6F64]">{item.type} · {item.area}</p>
              </div>
              <StatusPill status={item.status} />
            </div>
          ))}
        </div>
      </div>
    </DeskFrame>
  );
}
