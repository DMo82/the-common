import { createFileRoute } from "@tanstack/react-router";
import { DeskDenied, DeskLocked, deskAllows, useDeskSeat } from "@/components/desk/DeskFrame";

export const Route = createFileRoute("/desk/communication")({ component: CommunicationDesk });

const items = [
  { title: "Push notifications", body: "Send a note to one neighbourhood." },
  { title: "Home banners", body: "A festival or council warning on the home screen." },
  { title: "Email newsletters", body: "Export the subscriber list and send the weekly note." },
  { title: "Community alerts", body: "Pin an urgent alert for a neighbourhood." },
];

function CommunicationDesk() {
  const { seat, ready } = useDeskSeat();
  if (!ready) return <p className="p-6 text-sm text-muted">Loading communication.</p>;
  if (!seat) return <DeskLocked />;
  if (!deskAllows(seat, "admin")) return <DeskDenied />;
  return (
    <div className="mx-auto grid max-w-3xl gap-3">
      <h1 className="font-serif text-3xl text-deep">Communication and engagement</h1>
      {items.map((item) => (
        <section key={item.title} aria-disabled="true" className="rounded-2xl border border-line bg-band p-4 text-muted">
          <h2 className="font-serif text-2xl">{item.title}</h2>
          <p className="mt-1 text-sm">{item.body}</p>
          <p className="mt-2 text-xs">Next version</p>
        </section>
      ))}
    </div>
  );
}
