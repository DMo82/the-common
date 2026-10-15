import { createFileRoute } from "@tanstack/react-router";
import { DeskDenied, DeskLocked, deskAllows, useDeskSeat } from "@/components/desk/DeskFrame";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/desk/revenue")({ component: RevenueDesk });

function RevenueDesk() {
  const { seat, ready } = useDeskSeat();
  const businesses = useCommon((state) => state.businesses);
  const reservations = useCommon((state) => state.reservations);
  if (!ready) return <p className="p-6 text-sm text-muted">Loading revenue.</p>;
  if (!seat) return <DeskLocked />;
  if (!deskAllows(seat, "admin")) return <DeskDenied />;
  const published = businesses.filter((row) => row.status === "published").length;
  const categories = [
    { title: "Paid placements", body: "Sponsored listings and home banners. Not billed yet." },
    { title: "Event revenue", body: `${reservations.length} ticket holds recorded. Organiser payouts are not billed yet.` },
    { title: "Subscriptions", body: `${published} published pages. A page is free for three months, then £10 a month.` },
    { title: "Ticket sales", body: "Ticket sales carry a 10% fee. Payouts are not billed yet." },
  ];
  return (
    <div className="mx-auto grid max-w-3xl gap-3">
      <h1 className="font-serif text-3xl text-deep">Revenue and monetisation</h1>
      {categories.map((item) => (
        <details key={item.title} className="rounded-2xl border border-line bg-white p-4">
          <summary className="cursor-pointer font-serif text-2xl text-deep">{item.title}</summary>
          <p className="mt-2 text-sm text-muted">{item.body}</p>
        </details>
      ))}
    </div>
  );
}
