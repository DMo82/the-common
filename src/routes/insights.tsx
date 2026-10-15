import { createFileRoute, Link } from "@tanstack/react-router";
import { BackButton, Card, Shell, backButtonClass } from "@/components/common/Shell";
import { ownsRecord } from "@/lib/common/model";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/insights")({ component: InsightsPage });

const ROWS = [
  ["views", "Pages opened"],
  ["signups", "Registrations"],
  ["logins", "Sign-ins"],
  ["favourites", "Favourites held"],
  ["bookings", "Booking requests"],
  ["reports", "Reports sent"],
  ["messages", "Messages sent"],
] as const;

function InsightsPage() {
  const [consent] = useState(true);
  const account = useCommon((state) => state.account);
  const measures = useCommon((state) => state.measures);
  const businesses = useCommon((state) => state.businesses);
  const choice = useCommon((state) => state.cookieChoice);
  const owned = businesses.filter((row) => ownsRecord(row, account));
  if (!owned.length) {
    return (
    <div className="mb-3 rounded-xl border border-line bg-paper p-3 text-sm text-muted">
      Analytics are collected with your consent. You can opt out in settings.
    </div>
      <Shell>
        <Card>
          <h1 className="font-serif text-3xl text-deep">Measures</h1>
          <p className="mt-2 text-sm text-muted">Only a store owner can see tracking for their business.</p>
        </Card>
      </Shell>
    );
  }
  return (
    <Shell>
      <Card>
        <p className="text-xs font-semibold tracking-[0.14em] text-primary">MEASURES</p>
        <h1 className="mt-2 font-serif text-3xl text-deep">On this phone</h1>
        <p className="mt-2 text-sm text-muted">
          {choice === "measures"
            ? "These counts are the Stage 0 KPIs. They stay on this device until a shared analytics store is connected."
            : "Measures are off. Allow them in the cookie bar to start counting. We count aggregate views only. No user id is stored with a view."}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {ROWS.map(([key, label]) => (
            <div key={key} className="rounded-2xl bg-band p-3">
              <p className="text-xs text-muted">{label}</p>
              <p className="font-serif text-2xl text-deep">{measures?.[key] ?? 0}</p>
            </div>
          ))}
        </div>
        <h2 className="mt-5 text-lg">Business pages</h2>
        <div className="mt-2 grid gap-2 text-sm">
          {owned.map((row) => (
            <p key={row.id} className="flex justify-between gap-3">
              <span className="min-w-0 truncate">{row.name}</span>
              <span className="shrink-0 text-muted">{row.views} views · {row.directions} directions</span>
            </p>
          ))}
        </div>
      </Card>
    </Shell>
  );
}
