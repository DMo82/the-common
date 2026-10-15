import { createFileRoute, Link } from "@tanstack/react-router";
import { DoorCheck } from "@/components/common/DoorCheck";
import { DeskDenied, DeskLocked, deskAllows, useDeskSeat } from "@/components/desk/DeskFrame";
import { areaFor } from "@/lib/common/model";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/desk/business")({ component: BusinessDesk });

function BusinessDesk() {
  const { seat, ready } = useDeskSeat();
  const businesses = useCommon((state) => state.businesses);
  const events = useCommon((state) => state.events);
  const listings = useCommon((state) => state.listings);
  const enquiries = useCommon((state) => state.enquiries);

  if (!ready) return null;
  if (!seat) return <DeskLocked />;
  if (!deskAllows(seat, "business")) return <DeskDenied />;

  return (
    <div>
      <p className="text-xs tracking-wide text-muted">
        <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">Shops</span>
        Every published page
      </p>
      <h1 className="mt-2 break-words font-serif text-3xl leading-tight text-deep">Business</h1>
      <p className="mt-2 max-w-3xl text-sm text-muted">
        Super admin view of every page. A shop owner still registers and submits from their own account, and an admin still has to approve an event or a listing before it is public. You are not signed in as a shop.
      </p>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs tracking-wide text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Business</th>
              <th className="px-3 py-2 font-medium">Area</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Waiting</th>
              <th className="px-3 py-2 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((row) => {
              const pendingEvents = events.filter((event) => event.businessId === row.id && event.status === "pending").length;
              const pendingListings = listings.filter((item) => item.businessId === row.id && item.status === "pending").length;
              const notes = enquiries.filter((item) => item.businessId === row.id).length;
              return (
                <tr key={row.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2">
                    <Link to="/business/$id" params={{ id: row.id }} search={{ from: "" }} className="font-medium text-primary">{row.name}</Link>
                    <p className="text-xs text-muted">{row.category}</p>
                  </td>
                  <td className="px-3 py-2">{areaFor(row.postcode)?.discoveryName ?? row.postcode}</td>
                  <td className="px-3 py-2 capitalize">{row.status.replaceAll("_", " ")}</td>
                  <td className="px-3 py-2">{pendingEvents} events · {pendingListings} listings</td>
                  <td className="px-3 py-2">{notes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm">
        <Link to="/owner" search={{ section: "" }} className="font-medium text-primary">Open the owner form</Link>
        <span className="text-muted"> to register a page with a resident account. It stays pending until admin approves it.</span>
      </p>
      <div className="mt-8 max-w-xl">
        <DoorCheck events={events.filter((row) => row.status === "published")} heading="Door" />
      </div>
    </div>
  );
}
