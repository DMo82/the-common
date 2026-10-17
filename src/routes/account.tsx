import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, Card } from "@/components/common/Shell";
import { canAccess } from "@/lib/common/staff";
import { useCommon } from "@/lib/common/store";
import { dutiesFor } from "@/lib/common/staff";
import { ownsRecord } from "@/lib/common/model";
import { LAMBETH_NEIGHBOURHOODS } from "@/lib/common/boundaries";
import { visibleListings } from "@/lib/common/market";

export const Route = createFileRoute("/account")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search.next === "string" && search.next.startsWith("/") ? search.next : "/",
  }),
  component: AccountPage,
});

function KeptLine({ id, from }: { id: string; from: "saved" | "favourite" }) {
  const news = useCommon((state) => state.news);
  const events = useCommon((state) => state.events);
  const businesses = useCommon((state) => state.businesses);
  const listings = useCommon((state) => state.listings);
  const story = news.find((row) => row.id === id);
  if (story) return <Link to="/news/$id" params={{ id }} search={{ from }} className="mt-1 block font-medium text-primary">{story.title}</Link>;
  const event = events.find((row) => row.id === id);
  if (event) return <Link to="/event/$id" params={{ id }} search={{ from }} className="mt-1 block font-medium text-primary">{event.title}</Link>;
  const business = businesses.find((row) => row.id === id);
  if (business) return <Link to="/business/$id" params={{ id }} search={{ from }} className="mt-1 block font-medium text-primary">{business.name}</Link>;
  const listing = listings.find((row) => row.id === id);
  if (listing) return <Link to="/listing/$id" params={{ id }} search={{ from }} className="mt-1 block font-medium text-primary">{listing.title}</Link>;
  return null;
}

function KeepLinks() {
  return (
    <div className="mt-3 grid gap-1">
      <Link to="/" search={{ keep: "favourite" }} className="font-medium text-primary">Favourite news</Link>
      <Link to="/events" search={{ business: "", mine: "", keep: "favourite" }} className="font-medium text-primary">Favourite events</Link>
      <Link to="/businesses" search={{ keep: "favourite" }} className="font-medium text-primary">Favourite businesses</Link>
      <Link to="/market" search={{ business: "", mine: "", create: "", keep: "favourite" }} className="font-medium text-primary">Favourite listings</Link>
    </div>
  );
}

function AccountPage() {
  const { next } = Route.useSearch();
  const account = useCommon((state) => state.account);
  const follows = useCommon((state) => state.follows);
  const businesses = useCommon((state) => state.businesses);
  const events = useCommon((state) => state.events);
  const listings = useCommon((state) => state.listings);
  const staffGrants = useCommon((state) => state.staffGrants);
  const duties = dutiesFor(account?.email, staffGrants ?? []);
  const reservations = useCommon((state) => state.reservations);
  const favourites = useCommon((state) => state.favourites ?? []);
  const clearAccount = useCommon((state) => state.clearAccount);
  const setAccount = useCommon((state) => state.setAccount);
  const requestErasure = useCommon((state) => state.requestErasure);
  const mine = reservations.filter((row) => row.accountName === account?.name);
  const owned = businesses.filter((row) => ownsRecord(row, account));
  const ownedIds = new Set(owned.map((row) => row.id));
  const myEvents = events.filter((row) => ownsRecord(row, account) || ownedIds.has(row.businessId));
  const myListings = visibleListings(listings).filter((row) => ownsRecord(row, account) || ownedIds.has(row.businessId));
  const approved = owned.some((row) => row.status === "published");

  return (
    <Shell>
      <Card>
        <div className="flex items-center justify-between gap-2"><h1 className="font-serif text-3xl text-deep">My Common</h1></div>
        {account ? null : (
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link to="/login" search={{ next }} className="min-h-11 shrink-0 rounded-full bg-primary px-4 py-3 text-sm font-medium text-on-primary">
              Log in
            </Link>
            <Link to="/signup" search={{ next, email: "" }} className="min-h-11 shrink-0 rounded-full border border-line px-4 py-3 text-sm font-medium">
              Register
            </Link>
          </div>
        )}
        {account ? null : (
          <p className="mt-3 text-left text-sm text-muted">
            Have a wander without an account. Sign up when you want to follow a place, keep a favourite, or speak for a business, club or paper.
          </p>
        )}

        {account ? (
          <section className="mt-4 grid gap-2">
            <Link to="/personal" className="rounded-2xl border border-line bg-white p-4"><p className="font-medium">My Personal Profile</p><p className="text-sm text-muted">Picture, introduction, contact and area</p></Link>
            <Link to="/key" className="rounded-2xl border border-line bg-white p-4"><p className="font-medium">My Common Key</p><p className="text-sm text-muted">Name, unique ID and linked pages</p></Link>
            <Link to="/owner" search={{ section: "" }} className="rounded-2xl border border-line bg-white p-4"><p className="font-medium">My Business Profile</p><p className="text-sm text-muted">{owned.length ? `${owned.length} page${owned.length === 1 ? "" : "s"}` : "Create or manage a page"}</p></Link>
            <Link to="/events" search={{ business: "", mine: "1", keep: "" }} className="rounded-2xl border border-line bg-white p-4"><p className="font-medium">My Events</p><p className="text-sm text-muted">{myEvents.length ? `${myEvents.length} event${myEvents.length === 1 ? "" : "s"}` : "Create or manage events"}</p></Link>
            <Link to="/settings" className="rounded-2xl border border-line bg-white p-4"><p className="font-medium">Settings</p><p className="text-sm text-muted">Dark mode and notifications</p></Link>
            <Link to="/market" search={{ business: "", mine: "1", create: "", keep: "" }} className="rounded-2xl border border-line bg-white p-4"><p className="font-medium">My Marketplace</p><p className="text-sm text-muted">{myListings.length ? `${myListings.length} listing${myListings.length === 1 ? "" : "s"}` : "Create or manage listings"}</p></Link>
          </section>
        ) : null}
        {canAccess(account?.email, account?.kind, "super") || canAccess(account?.email, account?.kind, "admin") || duties.includes("admin") ? (
          <section className="mt-4 grid gap-2">
            <h2 className="font-serif text-2xl text-deep">Management and administration</h2>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/desk/owner" className="rounded-xl border border-line bg-white p-3 text-sm font-medium">Business</Link>
              <Link to="/desk/organiser" className="rounded-xl border border-line bg-white p-3 text-sm font-medium">Events</Link>
            </div>
            {canAccess(account?.email, account?.kind, "super") || canAccess(account?.email, account?.kind, "admin") || duties.includes("admin") ? <Link to="/desk" className="rounded-2xl border border-line bg-white p-4"><p className="font-medium">Staff desk</p><p className="text-sm text-muted">Approvals, people and reports</p></Link> : null}
          </section>
        ) : null}
        {canAccess(account?.email, account?.kind, "journalist") || canAccess(account?.email, account?.kind, "super") || account?.kind === "council" || account?.kind === "council_partner" || account?.kind === "charity" ? (
          <section className="mt-4 grid gap-2">
            <h2 className="font-serif text-2xl text-deep">Partner Workspaces</h2>
            <div className="grid gap-2">
              <Link to="/desk/council" className="rounded-2xl border border-line bg-white p-4"><p className="font-medium">Council desk</p><p className="text-sm text-muted">Neighbourhood counts, services and incident notes</p></Link>
              {canAccess(account?.email, account?.kind, "journalist") ? <Link to="/desk/journalist" className="rounded-2xl border border-line bg-white p-4"><p className="font-medium">Journalist desk</p><p className="text-sm text-muted">Articles and approvals</p></Link> : null}
              {account?.kind === "charity" ? <Link to="/desk/charity" className="rounded-2xl border border-line bg-white p-4"><p className="font-medium">Charity desk</p><p className="text-sm text-muted">Charity listings</p></Link> : null}
            </div>
          </section>
        ) : null}
        {account ? (
          <div className="mt-4 grid gap-4">
            <section className="rounded-2xl border border-line bg-white p-4 text-sm">
              <p className="text-xs font-semibold tracking-[0.14em] text-primary">FOLLOWING</p>
              <p className="mt-1 font-serif text-2xl text-deep">{follows.length} {follows.length === 1 ? "business" : "businesses"}</p>
              {follows.length === 0 ? <p className="mt-2 text-muted">You're not following any businesses yet.</p> : follows.map((id) => {
                const business = businesses.find((row) => row.id === id);
                return business ? <Link key={id} to="/business/$id" params={{ id }} search={{ from: "" }} className="mt-2 block font-medium text-primary">{business.name}</Link> : null;
              })}
            </section>
            <section className="rounded-2xl border border-line bg-white p-4 text-sm">
              <p className="text-xs font-semibold tracking-[0.14em] text-primary">FAVOURITES</p>
              <div className="mt-3 grid gap-2">
                <Link to="/" search={{ keep: "favourite" }} className="font-medium text-primary">Favourite news</Link>
                <Link to="/events" search={{ business: "", mine: "", keep: "favourite" }} className="font-medium text-primary">Favourite events</Link>
                <Link to="/businesses" search={{ keep: "favourite" }} className="font-medium text-primary">Favourite businesses</Link>
                <Link to="/market" search={{ business: "", mine: "", create: "", keep: "favourite" }} className="font-medium text-primary">Favourite listings</Link>
              </div>
            </section>
            <Link to="/tickets" className="rounded-2xl border border-line bg-white p-4 text-sm">
              <p className="text-xs font-semibold tracking-[0.14em] text-primary">TICKETS</p>
              <p className="mt-1 font-serif text-2xl text-deep">{mine.length} {mine.length === 1 ? "ticket" : "tickets"}</p>
            </Link>
          </div>
        ) : null}
        {account?.kind === "business" && !approved ? <Link to="/owner" search={{ section: "" }} className="mt-3 inline-block text-sm font-medium text-primary">{owned.length ? "Your page is with admin" : "Create the business page"}</Link> : null}
      </Card>
      <div className="mt-4 rounded-2xl border border-line bg-white p-4 text-left text-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-primary">POLICIES</p>
        
        <div className="mt-3 grid gap-2">
          <Link to="/legal" search={{ page: "terms" }} className="rounded-2xl border border-line bg-white px-4 py-3 font-medium shadow-[0_8px_18px_-16px_rgba(16,40,32,0.8)]">Terms and conditions</Link>
          <Link to="/legal" search={{ page: "privacy" }} className="rounded-2xl border border-line bg-white px-4 py-3 font-medium shadow-[0_8px_18px_-16px_rgba(16,40,32,0.8)]">Privacy policy</Link>
          <Link to="/legal" search={{ page: "cookies" }} className="rounded-2xl border border-line bg-white px-4 py-3 font-medium shadow-[0_8px_18px_-16px_rgba(16,40,32,0.8)]">Cookie policy</Link>
          <Link to="/legal" search={{ page: "company" }} className="rounded-2xl border border-line bg-white px-4 py-3 font-medium shadow-[0_8px_18px_-16px_rgba(16,40,32,0.8)]">Company details</Link>
        </div>
      </div>
      {account ? (
        <div className="mt-4 rounded-2xl border border-line bg-white p-4 text-sm">
          <p className="text-xs font-semibold tracking-[0.14em] text-primary">WEEKLY NOTE</p>
          <p className="mt-1 text-muted">Prepared from support@thecommon.community through FastHosts. It is not sent until the mailbox password is set. A free public member still only looks.</p>
        </div>
      ) : null}
      {account ? (
        <div className="mt-6 mb-4 flex justify-center">
          <button type="button" onClick={() => clearAccount()} className="min-h-11 shrink-0 rounded-full border border-line bg-white px-4 text-sm font-medium">
            Log out
          </button>
        </div>
      ) : null}
    {account ? <div className="mt-4 rounded-2xl border border-line bg-white p-4 text-sm"><p className="font-medium">My Common Key</p><p className="mt-1 text-muted">Your unique ID, QR code and linked pages.</p><Link to="/key" className="mt-2 inline-block font-medium text-primary">Open My Common Key</Link></div> : null}
        {account ? <button type="button" className="mt-6 text-sm text-warn" onClick={() => { if (window.confirm("Deactivate this account and remove personal fields?")) requestErasure(); }}>Request erasure</button> : null}
    </Shell>
  );
}
