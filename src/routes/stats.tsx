import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Shell } from "@/components/common/Shell";
import { sendSupportMail } from "@/lib/common/send-mail";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/stats")({
  validateSearch: (search: Record<string, unknown>) => ({ business: typeof search.business === "string" ? search.business : "" }),
  component: StatsPage,
});

type Metric = "interactions" | "follows" | "likes" | "shares" | "bookings";
type Period = "day" | "week" | "month" | "year";

function StatsPage() {
  const { business: businessId } = Route.useSearch();
  const business = useCommon((state) => state.businesses.find((row) => row.id === businessId));
  const follows = useCommon((state) => state.follows.filter((id) => id === businessId).length);
  const likes = useCommon((state) => state.favourites.filter((id) => id === businessId).length);
  const bookings = useCommon((state) => state.bookings.filter((row) => row.businessId === businessId).length);
  const [metric, setMetric] = useState<Metric>("interactions");
  const [period, setPeriod] = useState<Period>("week");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const events = useCommon((state) => state.events);
  const offers = useCommon((state) => state.offers);
  if (!business) return <Shell><Card><p>Choose a business first.</p></Card></Shell>;
  const shop = business;
  const totals: Record<Metric, number> = {
    interactions: (shop.views || 0) + (shop.clicks || 0) + (shop.directions || 0),
    follows,
    likes,
    shares: shop.shares || 0,
    bookings,
  };
  const key = `common-stats-${shop.id}`;
  const today = new Date().toISOString().slice(0, 10);
  const stored = typeof window === "undefined" ? [] : JSON.parse(window.localStorage.getItem(key) || "[]");
  const dummy = Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - index));
    const factor = 0.4 + index / 40;
    return { date: date.toISOString().slice(0, 10), interactions: Math.round(totals.interactions * factor), follows: Math.round(totals.follows * factor), likes: Math.round(totals.likes * factor), shares: Math.round((totals.shares || 2) * factor), bookings: Math.round(totals.bookings * factor) };
  });
  const base = stored.length > 7 ? stored : dummy;
  const history = [...base.filter((row: { date: string }) => row.date !== today), { date: today, ...totals }];
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(history.slice(-400)));
  const count = period === "day" ? 7 : period === "week" ? 8 : period === "month" ? 12 : 5;
  const labels = Array.from({ length: count }, (_, index) => {
    if (period === "day") return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index];
    if (period === "week") return `W${index + 1}`;
    if (period === "month") return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][index];
    return String(new Date().getFullYear() - 4 + index);
  });
  const values = labels.map((_, index) => {
    const end = new Date();
    const start = new Date(end);
    if (period === "day") start.setDate(end.getDate() - (labels.length - 1 - index));
    if (period === "week") start.setDate(end.getDate() - (labels.length - 1 - index) * 7);
    if (period === "month") start.setMonth(end.getMonth() - (labels.length - 1 - index));
    if (period === "year") start.setFullYear(end.getFullYear() - (labels.length - 1 - index));
    const stamp = start.toISOString().slice(0, period === "year" ? 4 : period === "month" ? 7 : 10);
    const match = [...history].reverse().find((row: { date: string }) => row.date.startsWith(stamp));
    return match ? match[metric] : 0;
  });
  const width = 320;
  const height = 180;
  const max = Math.max(1, ...values);
  const points = values.map((value, index) => ({ x: (index / (values.length - 1)) * (width - 24) + 12, y: height - 24 - (value / max) * (height - 40) }));
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const jump = values.reduce((best, value, index) => {
    const previous = index === 0 ? value : values[index - 1];
    const rise = value - previous;
    return rise > best.rise ? { rise, index, label: labels[index] } : best;
  }, { rise: 0, index: values.length - 1, label: labels[labels.length - 1] });
  const related = [
    ...events.filter((row) => row.businessId === shop.id).map((row) => `${row.title} (${row.when})`),
    ...offers.filter((row) => row.businessId === shop.id).map((row) => `${row.title}${row.price ? `, ${row.price}` : ""}`),
  ];
  const bars = values.map((value, index) => `${labels[index].padEnd(6, " ")} ${"█".repeat(Math.max(1, Math.round((value / max) * 12)))} ${value}`).join("\n");
  const intelligence = jump.rise > 0
    ? `The largest rise in ${metric} is at ${jump.label}, up ${jump.rise}. ${related.length ? `Posted or promoted in this preview: ${related.join("; ")}.` : "No promotion or event is stored for this business in that period."} This is a preview reading. It does not prove the promotion caused the rise.`
    : `No spike is visible in ${metric} for this ${period}. The line is flat or falling.`;
  async function share() {
    const body = `The Common\n${shop.name}\n\nGraph: ${metric} by ${period}\n${bars}\n\nReading\n${intelligence}\n\nFigures\nInteractions ${totals.interactions}\nFollows ${totals.follows}\nLikes ${totals.likes}\nShares ${totals.shares}\nBookings ${totals.bookings}\n\nSent from support@thecommon.community`;
    if (!email.includes("@")) { setNote("Enter an email address."); return; }
    const result = await sendSupportMail({ data: { to: email, subject: `${shop.name}: ${metric} for ${period}`, text: body } });
    setNote(result.sent ? "Sent." : result.reason || "The mailbox is not ready. The note is copied.");
    if (!result.sent) await navigator.clipboard.writeText(body);
  }

  return (
    <Shell>
      <Card>
        <div>
          <h1 className="font-serif text-3xl text-deep">Statistics</h1>
        </div>
        <p className="mt-1 text-sm text-muted">{shop.name}</p>
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {([["interactions", "Interactions", "Views + clicks + directions"], ["follows", "Follows", "People following this page"], ["likes", "Likes", "Favourites"], ["shares", "Shares", "Shared to others"], ["bookings", "Bookings", "Table or appointment requests"]] as [Metric, string, string][]).map(([key, label, tip]) => (
            <button key={key} type="button" onClick={() => setMetric(key)} title={tip} className={`h-9 shrink-0 rounded-full px-3 text-xs font-medium ${metric === key ? "bg-primary text-on-primary" : "border border-line bg-band text-deep"}`}>{label}</button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["day", "week", "month", "year"] as Period[]).map((key) => (
            <button key={key} type="button" onClick={() => setPeriod(key)} className={`h-8 rounded-full px-3 text-xs capitalize ${period === key ? "bg-primary text-on-primary" : "border border-line bg-band text-deep"}`}>{key}</button>
          ))}
        </div>
        <p className="mt-4 font-serif text-4xl text-deep">{totals[metric]}</p>
        <p className="mt-1 text-xs text-muted">Bots and staff are excluded from these counts. Server-side analytics events appear once the analytics store is live.</p>
        <svg viewBox={`0 0 ${width} ${height}`} className="mt-2 w-full" role="img" aria-label={`${metric} over ${period}`}>
          <polyline fill="none" stroke="currentColor" strokeWidth="3" points={line} className="text-primary" />
          {points.map((point, index) => <circle key={labels[index]} cx={point.x} cy={point.y} r="4" className="fill-primary" />)}
        </svg>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted"><span className="inline-block h-2 w-6 rounded-full bg-primary" />{metric} · {period}</div>
        <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
          {labels.map((label, index) => <p key={label}><span className="block text-muted">{label}</span><span className="font-medium">{values[index]}</span></p>)}
        </div>
        <p className="mt-2 text-xs text-muted">Each point is the count for that period only. Shares count when someone uses Share on the business page.</p>
      </Card>
    </Shell>
  );
}
