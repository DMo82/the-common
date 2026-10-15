import { createFileRoute, Link } from "@tanstack/react-router";
import { DeskDenied, DeskLocked, deskAllows, useDeskSeat } from "@/components/desk/DeskFrame";

export const Route = createFileRoute("/desk/home")({ component: DeskHome });

function DeskHome() {
  const { seat, ready } = useDeskSeat();
  if (!ready) return <p className="p-6 text-sm text-muted">Loading.</p>;
  if (!seat) return <DeskLocked />;
  if (!deskAllows(seat, "admin")) return <DeskDenied />;

  const links = [
    { to: "/desk/admin", label: "Admin" },
    { to: "/desk/queues", label: "Queues" },
    { to: "/desk/safeguarding", label: "Safety" },
    { to: "/desk/revenue", label: "Money" },
    { to: "/desk/messages", label: "Messages" },
    { to: "/desk/flags", label: "Flags" },
  ];

  return (
    <div className="mx-auto grid max-w-3xl gap-3">
      <h1 className="font-serif text-3xl text-deep">Desk home</h1>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {links.map((link) => (
          <Link key={link.to} to={link.to} className="rounded-xl border border-line bg-white p-4 text-center font-medium hover:bg-paper">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
