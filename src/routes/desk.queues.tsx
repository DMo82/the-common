import { createFileRoute } from "@tanstack/react-router";
import { DeskFrame } from "@/components/desk/DeskFrame";
import { StatusPill } from "@/components/desk/StatusPill";
import { Drawer } from "@/components/desk/Drawer";
import { useShortcuts, ShortcutHint } from "@/components/desk/Shortcuts";
import { useState } from "react";

export const Route = createFileRoute("/desk/queues")({ component: QueuesDesk });

const ITEMS = [
  { id: "biz_1", type: "Business", title: "Be U Studio", status: "pending", area: "Clapham", urgent: false },
  { id: "evt_1", type: "Event", title: "Jazz Night", status: "pending", area: "Brixton", urgent: true },
  { id: "lst_1", type: "Listing", title: "Bakery equipment", status: "pending", area: "Streatham", urgent: false },
];

function QueuesDesk() {
  const [selected, setSelected] = useState<typeof ITEMS[0] | null>(null);
  useShortcuts({ onApprove: () => selected && alert("Approved"), onDecline: () => selected && alert("Declined"), onNext: () => setSelected(null) });
  const sorted = [...ITEMS].sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));

  return (
    <DeskFrame>
      <div className="grid gap-4">
        <h1 className="text-2xl font-bold text-[#102820]">Queues</h1>
        <p className="text-sm text-[#5C6F64]">Items waiting for approval. Urgent items pinned top.</p>
        <ShortcutHint />
        <div className="rounded-xl border border-[#E8EDE9] bg-white">
          {sorted.map((item) => (
            <button key={item.id} type="button" onClick={() => setSelected(item)} className="flex w-full items-center justify-between border-b border-[#E8EDE9] px-4 py-3 text-left last:border-0 hover:bg-[#E8EDE9]">
              <div>
                <p className="font-medium text-[#102820]">{item.title}</p>
                <p className="text-xs text-[#5C6F64]">{item.type} · {item.area}</p>
              </div>
              <div className="flex items-center gap-2">
                {item.urgent ? <span className="rounded-full bg-[#FBE3E3] px-2 py-0.5 text-xs font-semibold text-[#8A1C1C]">Urgent</span> : null}
                <StatusPill status={item.status} />
              </div>
            </button>
          ))}
        </div>
      </div>
      <Drawer open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title || "Review"}>
        {selected ? (
          <div className="grid gap-4">
            <p className="text-sm text-[#5C6F64]">{selected.type} · {selected.area}</p>
            <div className="grid gap-2">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Details are accurate</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Safe and lawful</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Contact details work</label>
            </div>
            <div className="flex gap-2">
              <button type="button" className="rounded-lg bg-[#306830] px-4 py-2 text-sm text-white">Approve</button>
              <button type="button" className="rounded-lg bg-[#8A1C1C] px-4 py-2 text-sm text-white">Decline</button>
            </div>
          </div>
        ) : null}
      </Drawer>
    </DeskFrame>
  );
}
