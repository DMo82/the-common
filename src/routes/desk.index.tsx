import { createFileRoute, Link } from "@tanstack/react-router";
import { DeskFrame } from "@/components/desk/DeskFrame";

export const Route = createFileRoute("/desk/")({ component: DeskHome });

const DO_NEXT = [
  { id: "biz_1", type: "Business", title: "Be U Studio", area: "Clapham", href: "/desk/queues?item=biz_1" },
  { id: "evt_1", type: "Event", title: "Jazz Night", area: "Brixton", href: "/desk/queues?item=evt_1", urgent: true },
  { id: "case_1", type: "Case", title: "Report #aud_2cec", area: "Streatham", href: "/desk/safeguarding?item=case_1" },
];

function DeskHome() {
  return (
    <DeskFrame>
      <div className="grid gap-4">
        <h1 className="text-2xl font-bold text-[#102820]">Today</h1>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Link to="/desk/queues" className="rounded-xl border border-[#E8EDE9] bg-white p-3 hover:border-[#003820]">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">Waiting</p>
            <p className="mt-1 text-2xl font-bold text-[#102820]">12</p>
          </Link>
          <Link to="/desk/queues?filter=overdue" className="rounded-xl border border-[#E8EDE9] bg-white p-3 hover:border-[#8A1C1C]">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">Overdue</p>
            <p className="mt-1 text-2xl font-bold text-[#8A1C1C]">3</p>
          </Link>
          <Link to="/desk/queues?filter=approved" className="rounded-xl border border-[#E8EDE9] bg-white p-3 hover:border-[#306830]">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">Approved today</p>
            <p className="mt-1 text-2xl font-bold text-[#306830]">8</p>
          </Link>
          <Link to="/desk/safeguarding" className="rounded-xl border border-[#E8EDE9] bg-white p-3 hover:border-[#003820]">
            <p className="text-xs font-semibold uppercase text-[#5C6F64]">Open cases</p>
            <p className="mt-1 text-2xl font-bold text-[#102820]">2</p>
          </Link>
        </div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-medium text-[#102820]">Do next</h2>
          <div className="mt-3 grid gap-2">
            {DO_NEXT.map((item) => (
              <Link key={item.id} to={item.href as "/"} className="flex items-center justify-between rounded-lg border border-[#E8EDE9] px-3 py-2 hover:bg-[#E8EDE9]">
                <div>
                  <p className="font-medium text-[#102820]">{item.title}</p>
                  <p className="text-xs text-[#5C6F64]">{item.type} · {item.area}</p>
                </div>
                {item.urgent ? <span className="rounded-full bg-[#FBE3E3] px-2 py-0.5 text-xs font-semibold text-[#8A1C1C]">Urgent</span> : null}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DeskFrame>
  );
}
