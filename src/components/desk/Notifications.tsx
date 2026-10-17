import { Link } from "@tanstack/react-router";

type Notification = { id: string; title: string; href: string; unread: boolean };

const NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "Be U Studio needs approval", href: "/desk/queues?item=biz_1", unread: true },
  { id: "n2", title: "New safeguarding case", href: "/desk/safeguarding?item=case_1", unread: true },
  { id: "n3", title: "Jazz Night approved", href: "/desk/queues?item=evt_1", unread: false },
];

export function Notifications() {
  const unread = NOTIFICATIONS.filter((n) => n.unread).length;
  return (
    <div className="relative">
      <button type="button" className="relative grid h-9 w-9 place-items-center rounded-lg border border-[#E8EDE9]" aria-label="Notifications">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        {unread > 0 ? <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-[#8A1C1C] text-[10px] font-bold text-white">{unread}</span> : null}
      </button>
      <div className="absolute right-0 top-full z-30 mt-1 w-64 rounded-lg border border-[#E8EDE9] bg-white py-1 shadow-lg">
        {NOTIFICATIONS.map((n) => (
          <Link key={n.id} to={n.href as "/"} className={`block px-3 py-2 text-sm hover:bg-[#E8EDE9] ${n.unread ? "font-medium" : "text-[#5C6F64]"}`}>
            {n.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
