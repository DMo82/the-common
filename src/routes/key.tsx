import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, Card } from "@/components/common/Shell";
import { ownsRecord } from "@/lib/common/model";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/key")({ component: KeyPage });

function KeyPage() {
  const account = useCommon((state) => state.account);
  const businesses = useCommon((state) => state.businesses);
  const events = useCommon((state) => state.events);
  const listings = useCommon((state) => state.listings);
  const news = useCommon((state) => state.news);
  if (!account) {
    return (
      <Shell>
        <Card>
          <h1 className="font-serif text-3xl text-deep">My Common Key</h1>
          <p className="mt-2 text-sm">Sign in to see your key.</p>
          <Link to="/login" search={{ next: "/key" }} className="mt-3 inline-block text-sm font-medium text-primary">Log in</Link>
        </Card>
      </Shell>
    );
  }
  const id = account.id || "usr_super";
  const email = (account.email || "").toLowerCase();
  const name = account.name;
  const owned = businesses.filter((row) => ownsRecord(row, account));
  const ownedIds = new Set(owned.map((row) => row.id));
  const myEvents = events.filter((row) => ownsRecord(row, account) || ownedIds.has(row.businessId));
  const myListings = listings.filter((row) => ownsRecord(row, account) || ownedIds.has(row.businessId));
  const myNews = news.filter((row) => (row.author && row.author === name) || (row.email && row.email.toLowerCase() === email));
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(id)}`;
  return (
    <Shell>
      <Card>
        <div className="flex items-center justify-between gap-2">
          <h1 className="font-serif text-3xl text-deep">My Common Key</h1>
        </div>
        <p className="mt-1 text-sm text-muted">Show this QR when a business adds you as staff. It carries your unique ID.</p>
        <div className="mt-4 grid place-items-center gap-2">
          <img alt="My Common Key QR code" className="h-40 w-40 rounded-2xl border border-line bg-white p-2" src={qr} />
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted">{account.username || account.email}</p>
          <p className="break-all font-mono text-xs">{id}</p>
        </div>
        <div className="mt-4 grid gap-3">
          <Linked title="Businesses" rows={owned.map((row) => ({ id: row.id, label: row.name, to: `/business/${row.id}` }))} empty="No business is linked." />
          <Linked title="Events" rows={myEvents.map((row) => ({ id: row.id, label: row.title, to: `/event/${row.id}` }))} empty="No event is linked." />
          <Linked title="Marketplace listings" rows={myListings.map((row) => ({ id: row.id, label: row.title, to: `/listing/${row.id}` }))} empty="No listing is linked." />
          <Linked title="News articles" rows={myNews.map((row) => ({ id: row.id, label: row.title, to: `/news/${row.id}` }))} empty="No article is linked." />
        </div>
      </Card>
    </Shell>
  );
}

function Linked({ title, rows, empty }: { title: string; rows: { id: string; label: string; to: string }[]; empty: string }) {
  return (
    <section className="rounded-2xl border border-line p-3 text-sm">
      <p className="font-medium">{title} · {rows.length}</p>
      <div className="mt-1 grid gap-1">
        {rows.length === 0 ? <p className="text-muted">{empty}</p> : rows.map((row) => <Link key={row.id} to={row.to as "/business/$id"} params={{ id: row.id }} search={{ from: "" }} className="break-words font-medium text-primary">{row.label} <span className="font-normal text-muted">· {row.id}</span></Link>)}
      </div>
    </section>
  );
}
