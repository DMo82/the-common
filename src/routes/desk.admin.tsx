import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { DeskDenied, DeskLocked, deskAllows, useDeskSeat } from "@/components/desk/DeskFrame";
import { DeskPage } from "@/components/desk/DeskPage";
import { Drawer } from "@/components/desk/Drawer";
import { StatusPill } from "@/components/desk/StatusPill";
import { SearchBox } from "@/components/common/SearchBox";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/desk/admin")({
  validateSearch: (search: Record<string, unknown>) => ({
    section: (search.section === "news" || search.section === "businesses" || search.section === "market" || search.section === "events" ? search.section : "") as "" | "news" | "businesses" | "market" | "events",
    item: typeof search.item === "string" ? search.item : "",
  }),
  component: AdminDesk,
});

function AdminDesk() {
  const { section, item } = Route.useSearch();
  const { seat, ready } = useDeskSeat();
  const businesses = useCommon((state) => state.businesses);
  const events = useCommon((state) => state.events);
  const news = useCommon((state) => state.news);
  const reports = useCommon((state) => state.reports);
  const listings = useCommon((state) => state.listings);
  const [audit, setAudit] = useState<{ id: string; actor_id: string; action: string; item_id: string; actor_role: string | null; created_at: string; reason: string | null }[]>([]);
  useEffect(() => {
    fetch("/api/audit").then((r) => r.json()).then(setAudit).catch(() => {});
  }, []);
  const directory = useCommon((state) => state.directory ?? []);
  const serviceEdits = useCommon((state) => state.serviceEdits ?? {});
  const [auditQuery, setAuditQuery] = useState("");
  const [bizFilter, setBizFilter] = useState({ status: "all", area: "all" });

  if (!ready) return <p className="p-6 text-sm text-muted">Loading the admin desk.</p>;
  if (!seat) return <DeskLocked />;
  if (!deskAllows(seat, "admin")) return <DeskDenied />;
  if (section) return <ApprovalBoard section={section} item={item} actor={seat.email} publisher={seat.role === "super"} />;

  const waitingNews = news.filter((row) => row.status === "pending");
  const harm = reports.filter((row) => row.status === "open");
  const publishedEvt = events.filter((e) => e.status === "published").length;
  const openReports = harm.length;
  const publisher = seat.role === "super";
  const users = directory.length;

  return (
    <DeskPage
      title="Admin desk"
      scope={`${publisher ? "Super Administrator" : "Admin"} · All of Lambeth · everything waiting for a decision`}
      kpis={[
        { label: "Waiting", value: waitingNews.length + events.filter((r) => r.status === "pending").length + businesses.filter((r) => r.status === "pending").length + listings.filter((r) => r.status === "pending").length },
        { label: "Businesses", value: businesses.filter((r) => r.status === "published").length, note: "Published" },
        { label: "Events", value: events.filter((r) => r.status === "published").length, note: "Published" },
        { label: "Open cases", value: harm.length },
      ]}
      footer="Source: live store · updated just now"
    >
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-3 text-center"><p className="text-xl font-semibold text-[#003820]">{publishedEvt}</p><p className="text-xs text-muted">Events live</p></div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-3 text-center"><p className="text-xl font-semibold text-[#003820]">{openReports}</p><p className="text-xs text-muted">Open reports</p></div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-3 text-center"><p className="text-xl font-semibold text-[#003820]">{users}</p><p className="text-xs text-muted">Users</p></div>
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-3 text-center"><p className="text-xl font-semibold text-[#003820]">{businesses.filter((b) => b.status === "published").length}</p><p className="text-xs text-muted">Businesses live</p></div>
      </div>

      <details open className="rounded-2xl border border-line bg-white p-4">
        <summary className="cursor-pointer font-serif text-2xl text-deep">Pending approvals</summary>
        <div className="mt-3 grid gap-3">
          <PendingGroup title="News" section="news" rows={waitingNews.map((row) => ({ id: row.id, title: row.title, to: "/news/$id" as const }))} />
          <PendingGroup title="Events" section="events" rows={events.filter((row) => row.status === "pending").map((row) => ({ id: row.id, title: row.title, to: "/event/$id" as const }))} />
          <PendingGroup title="Businesses" section="businesses" rows={businesses.filter((row) => row.status === "pending" || row.status === "changes_requested").map((row) => ({ id: row.id, title: row.name, to: "/business/$id" as const }))} />
          <PendingGroup title="Marketplace listings" section="market" rows={listings.filter((row) => row.status === "pending").map((row) => ({ id: row.id, title: row.title, to: "/listing/$id" as const }))} />
          <PendingGroup title="Council services" rows={Object.keys(serviceEdits).map((id) => ({ id, title: serviceEdits[id].name || id, to: "/desk/council" as const }))} empty="No council service change is waiting." />
        </div>
      </details>

      <details className="rounded-2xl border border-line bg-white p-4">
        <summary className="cursor-pointer font-serif text-2xl text-deep">Management</summary>
        <div className="mt-3 grid gap-2">
          {["News: RSS and breaking alerts", "Businesses: category taxonomy", "Marketplace: dispute tools", "Events: venues and ticket totals"].map((label) => (
            <div key={label} aria-disabled="true" className="flex items-center justify-between rounded-xl border border-line bg-band px-3 py-2 text-sm text-muted">
              <span>{label}</span>
              <span className="text-xs">Not available yet</span>
            </div>
          ))}
        </div>
      </details>

      <details open className="rounded-2xl border border-line bg-white p-4">
        <summary className="cursor-pointer font-serif text-2xl text-deep">User and moderation management</summary>
        <div className="mt-3 grid gap-2">
          <details className="rounded-xl border border-line p-3">
            <summary className="cursor-pointer font-medium">People and roles</summary>
            <div className="mt-3 grid gap-2">
              <p className="text-sm text-muted">User search, the log and allocation stay on the Users chip. Safeguarding, age checks, appeals and content cases stay on the Safeguarding chip.</p>
              <Link to="/desk/users" className="text-sm font-medium text-primary">Open the people desk</Link>
              <Link to="/desk/safeguarding" className="text-sm font-medium text-primary">Open safeguarding</Link>
            </div>
          </details>
        </div>
      </details>

      <details className="rounded-2xl border border-line bg-white p-4">
        <summary className="cursor-pointer font-serif text-2xl text-deep">Waived partners</summary>
        <p className="mt-2 text-sm text-muted">Admin only. A waived partner has no card and no charge. The listing stays live. Convert to paying opens when Stripe is connected.</p>
      </details>

      <details className="rounded-2xl border border-line bg-white p-4">
        <summary className="cursor-pointer font-serif text-2xl text-deep">Analytics, reporting and settings</summary>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Metric label="People" value={directory.length} note="Registered" />
          <Metric label="Businesses" value={businesses.filter((row) => row.status === "published").length} note="Active = published and updated in the last 7 days" />
          <Metric label="Events" value={events.length} note={`${events.filter((row) => row.status === "published").length} published, ${events.filter((row) => row.status === "pending").length} pending`} />
          <Metric label="News" value={news.length} note={`${news.filter((row) => row.status === "published").length} published, ${news.filter((row) => row.status === "pending").length} pending`} />
          <Metric label="Listings" value={listings.length} note={`${listings.filter((row) => row.status === "published").length} published, ${listings.filter((row) => row.status === "pending").length} pending`} />
          <Metric label="Open cases" value={harm.length} note="Safeguarding" />
        </div>
        <div className="mt-3 grid gap-2">
          <Later label="App branding" />
        </div>
        <input value={auditQuery} onChange={(event) => setAuditQuery(event.target.value)} placeholder="Search audit by person or record" className="mt-3 min-h-11 w-full rounded-xl border border-line px-3" />
        <div className="mt-2 grid gap-1 text-sm">{audit.filter((row) => !auditQuery || `${row.actor_id} ${row.item_id} ${row.action}`.toLowerCase().includes(auditQuery.toLowerCase())).slice(0, 8).map((row) => <p key={row.id}>{row.created_at?.slice(0, 16).replace("T", " ") || "—"} · {row.actor_id} · {row.actor_role || "—"} · {row.action} · {row.item_id}</p>)}</div>
        <button type="button" className="mt-3 min-h-11 w-fit rounded-full bg-primary px-4 text-sm font-medium text-on-primary" onClick={() => {
          const safe = (value: string) => /^[=+\-@]/.test(value) ? "'" + value : value;
          const csv = ["When,Who,Role,Action,Record,Reason", ...audit.map((row) => [row.created_at, row.actor_id, row.actor_role, row.action, row.item_id, row.reason].map((cell) => `"${safe(String(cell || "")).replaceAll('"', '""')}"`).join(","))].join("\n");
          const blob = new Blob([csv], { type: "text/csv" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "the-common-audit.csv";
          link.click();
        }}>Export audit CSV</button>
      </details>
      <details className="mt-3 rounded-xl border border-line bg-white p-3">
        <summary className="cursor-pointer font-medium">Business management</summary>
        <div className="mt-2 flex flex-wrap gap-2">
          <select value={bizFilter.status} onChange={(e) => setBizFilter((f) => ({ ...f, status: e.target.value }))} className="min-h-10 rounded-xl border border-line px-2 text-sm">
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="published">Published</option>
            <option value="changes_requested">Changes requested</option>
          </select>
          <select value={bizFilter.area} onChange={(e) => setBizFilter((f) => ({ ...f, area: e.target.value }))} className="min-h-10 rounded-xl border border-line px-2 text-sm">
            <option value="all">All areas</option>
            {Array.from(new Set(businesses.map((b) => b.area))).map((area) => <option key={area} value={area}>{area}</option>)}
          </select>
        </div>
        <div className="mt-2 grid gap-1 text-sm">
          {businesses.filter((b) => (bizFilter.status === "all" || b.status === bizFilter.status) && (bizFilter.area === "all" || b.area === bizFilter.area)).slice(0, 20).map((b) => (
            <p key={b.id}>{b.name} · {b.area} · {b.status}</p>
          ))}
        </div>
      </details>
      <details className="mt-3 rounded-xl border border-line bg-white p-3">
        <summary className="cursor-pointer font-medium">Verification evidence</summary>
        <div className="mt-2 grid gap-1 text-sm">
          {evidence.map((row) => (
            <p key={row.id}>{row.submitted_at?.slice(0, 16).replace("T", " ") || "—"} · {row.business_id} · {row.notes || "No notes"} {row.evidence_url ? <a href={row.evidence_url} className="underline" target="_blank" rel="noreferrer">file</a> : null}</p>
          ))}
          {evidence.length === 0 ? <p className="text-muted">No evidence submitted.</p> : null}
        </div>
      </details>
    </DeskPage>
  );
}

function Later({ label }: { label: string }) {
  return <div aria-disabled="true" className="flex items-center justify-between rounded-xl border border-line bg-band px-3 py-2 text-sm text-muted"><span>{label}</span><span className="text-xs">Not available yet</span></div>;
}

function Metric({ label, value, note }: { label: string; value: number; note: string }) {
  return <article className="rounded-3xl border border-line bg-white p-4"><p className="text-sm text-muted">{label}</p><p className="font-serif text-3xl text-deep">{value}</p><p className="mt-1 text-xs text-muted">{note}</p></article>;
}

function PendingGroup({ title, section, rows, empty = "Nothing waiting. You're up to date." }: { title: string; section?: "news" | "businesses" | "market" | "events"; rows: { id: string; title: string; to: "/news/$id" | "/event/$id" | "/business/$id" | "/listing/$id" | "/desk/council" }[]; empty?: string }) {
  return (
    <details className="rounded-xl border border-line p-3">
      <summary className="cursor-pointer font-medium">{title} · {rows.length}</summary>
      <div className="mt-2 grid gap-2">
        {rows.length === 0 ? <p className="text-sm text-muted">{empty}</p> : rows.map((row) => (
          <div key={row.id} className="grid gap-1 rounded-xl border border-line px-3 py-2 text-sm">
            <span className="break-words font-medium">{row.title}</span>
            <span className="flex gap-3">
              {row.to === "/desk/council" ? <Link to="/desk/council" className="text-xs font-medium text-primary">View page</Link> : <Link to={row.to} params={{ id: row.id }} search={{ from: "desk" }} className="text-xs font-medium text-primary">View page</Link>}
              {section ? <Link to="/desk/admin" search={{ section, item: row.id }} className="text-xs font-medium text-primary">Decide</Link> : null}
            </span>
          </div>
        ))}
      </div>
    </details>
  );
}

function dayOf(text: string) {
  const iso = text.match(/20\d{2}-\d{2}-\d{2}/);
  if (iso) return iso[0];
  const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  const match = text.match(/(\d{1,2})\s+([A-Za-z]+)\s+(20\d{2})/);
  if (!match) return "";
  const month = months.indexOf(match[2].toLowerCase());
  if (month < 0) return "";
  return `${match[3]}-${String(month + 1).padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

function clockOf(text: string) {
  const iso = text.match(/T(\d{2}:\d{2})/);
  if (iso) return iso[1];
  const match = text.match(/(\d{1,2})[.:](\d{2})\s*(am|pm)/i);
  if (!match) return "";
  let hour = Number(match[1]) % 12;
  if (match[3].toLowerCase() === "pm") hour += 12;
  return `${String(hour).padStart(2, "0")}:${match[2]}`;
}

function stampOf(text: string) {
  if (!text) return 0;
  const iso = Date.parse(text);
  if (!Number.isNaN(iso) && text.includes("T")) return iso;
  const day = dayOf(text);
  if (!day) return 0;
  const clock = clockOf(text) || "00:00";
  return Date.parse(`${day}T${clock}:00`);
}

function ApprovalBoard({ section, item, actor, publisher }: { section: "news" | "businesses" | "market" | "events"; item: string; actor: string; publisher: boolean }) {
  const businesses = useCommon((state) => state.businesses);
  const events = useCommon((state) => state.events);
  const news = useCommon((state) => state.news);
  const listings = useCommon((state) => state.listings);
  const audit = useCommon((state) => state.audit);
  const decide = useCommon((state) => state.decide);
  const recommend = useCommon((state) => state.recommend);
  const submissions = useCommon((state) => state.submissions ?? []);
  const [query, setQuery] = useState({ name: "", user: "", from: "", to: "" });
  const title = section === "news" ? "News" : section === "businesses" ? "Businesses" : section === "market" ? "Marketplace" : "Events";
  const kind = section === "market" ? "listing" : section === "businesses" ? "business" : section === "events" ? "event" : "news";
  const source = section === "news" ? news.map((row) => ({ id: row.id, title: row.title, user: row.author || row.email || "", status: row.status, when: row.posted || "", detail: [row.excerpt, row.lead, row.author ? `By ${row.author}` : ""].filter(Boolean).join("\n") }))
    : section === "businesses" ? businesses.map((row) => ({ id: row.id, title: row.name, user: row.ownerName || row.ownerEmail || row.email || "", status: row.status, when: "", detail: [row.about, row.address, row.postcode, row.email].filter(Boolean).join("\n") }))
    : section === "market" ? listings.map((row) => ({ id: row.id, title: row.title, user: row.ownerName || row.ownerEmail || "", status: row.status, when: row.publishedAt || "", detail: [row.detail, row.priceLabel].filter(Boolean).join("\n") }))
    : events.map((row) => ({ id: row.id, title: row.title, user: row.ownerName || row.ownerEmail || "", status: row.status, when: `${row.date || ""} ${row.time || row.when || ""}`, detail: [row.when, row.place, row.detail].filter(Boolean).join("\n") }));
  const rows = source.map((row) => {
    const notes = audit.filter((item) => item.target === row.id);
    const published = notes.find((item) => /publish|approv/i.test(item.action))?.at || "";
    const declined = notes.find((item) => /refus|declin|reject/i.test(item.action))?.at || "";
    const requested = notes.find((item) => /submit|request|pending/i.test(item.action))?.at || notes[notes.length - 1]?.at || "";
    const when = row.status === "published" ? (published || row.when) : row.status === "refused" ? (declined || row.when) : (requested || row.when);
    return { ...row, when, stamp: stampOf(when) };
  }).filter((row) => {
    const nameQuery = query.name.trim().toLowerCase();
    const userQuery = query.user.trim().toLowerCase();
    if (nameQuery && !row.title.toLowerCase().includes(nameQuery)) return false;
    if (userQuery && !row.user.toLowerCase().includes(userQuery)) return false;
    const from = query.from ? Date.parse(`${query.from}T00:00:00`) : 0;
    const to = query.to ? Date.parse(`${query.to}T23:59:00`) : 0;
    if (from && row.stamp && row.stamp < from) return false;
    if (to && row.stamp && row.stamp > to) return false;
    return true;
  });
  const pending = rows.filter((row) => row.status === "pending" || row.status === "changes_requested");
  const approved = rows.filter((row) => row.status === "published");
  const denied = rows.filter((row) => row.status === "refused");
  function act(id: string, status: "published" | "changes_requested" | "refused", reason: string, checks: string[] = []) {
    if (publisher) decide(kind, id, status, reason, actor, checks);
    else recommend(kind, id, status, reason, actor);
  }
  const [view, setView] = useState<"all" | "pending" | "approved" | "denied">("all");
  const [selected, setSelected] = useState<string[]>([]);
  const chosen = item ? source.find((row) => row.id === item) : null;
  const shown = view === "pending" ? pending : view === "approved" ? approved : view === "denied" ? denied : [...pending, ...approved, ...denied];
  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      <div>
        <h1 className="font-serif text-3xl text-deep">{title}</h1>
        <p className="mt-1 text-sm text-muted">{pending.length} pending · {approved.length} approved · {denied.length} denied</p>
      </div>
      <div className="flex gap-1">
        {(["all", "pending", "approved", "denied"] as const).map((v) => (
          <button key={v} type="button" className={`rounded-full px-3 py-1 text-xs font-medium ${view === v ? "bg-[#003820] text-white" : "border border-[#E8EDE9] bg-white"}`} onClick={() => setView(v)}>{v === "all" ? "All" : v === "pending" ? "Waiting" : v === "approved" ? "Approved" : "Declined"}</button>
        ))}
      </div>
      {selected.length > 0 ? (
        <div className="flex items-center justify-between rounded-lg bg-[#102820] px-3 py-2 text-sm text-white">
          <span>{selected.length} selected</span>
          <div className="flex gap-2">
            <button type="button" className="rounded-full border border-white/30 px-3 py-1 text-xs" onClick={() => setSelected([])}>Clear</button>
          </div>
        </div>
      ) : null}
      <SearchBox values={query} onChange={setQuery} onSearch={() => document.getElementById("approval-results")?.scrollIntoView({ behavior: "smooth" })} />
      <div id="approval-results" className="grid gap-3">
        {view === "all" || view === "pending" ? <QueueGroup title="Pending approval" rows={pending} render={(row) => <ResultLine row={row} label="Requested" extra={<Decision title={row.title} detail="" checklist={kind === "business"} publisher={publisher} waiting={submissions.some((item) => item.kind === kind && item.itemId === row.id)} onDecide={(status, reason, checks) => act(row.id, status, reason, checks)} />} />} /> : null}
        {view === "all" || view === "approved" ? <QueueGroup title="Approved" rows={approved} render={(row) => <ResultLine row={row} label="Published" />} /> : null}
        {view === "all" || view === "denied" ? <QueueGroup title="Denied" rows={denied} render={(row) => <ResultLine row={row} label="Declined" />} /> : null}
      </div>
      <Drawer open={Boolean(chosen)} onClose={() => window.history.back()} title={chosen?.title || "Review"}>
        {chosen?.detail ? <p className="whitespace-pre-line text-sm text-muted">{chosen.detail}</p> : null}
        {chosen ? <Decision title={chosen.title} detail="" checklist={kind === "business"} publisher={publisher} waiting={submissions.some((row) => row.kind === kind && row.itemId === chosen.id)} onDecide={(status, reason, checks) => act(chosen.id, status, reason, checks)} /> : null}
      </Drawer>
    </div>
  );
}

function QueueGroup({ title, rows, render }: { title: string; rows: { id: string; title: string; user: string; status: string; when: string; detail?: string }[]; render: (row: { id: string; title: string; user: string; status: string; when: string; detail?: string }) => ReactNode }) {
  if (rows.length === 0) {
    return (
      <section className="rounded-2xl border border-line bg-white p-4">
        <h2 className="font-serif text-2xl text-deep">{title} · 0</h2>
      </section>
    );
  }
  return (
    <details className="rounded-2xl border border-line bg-white p-4">
      <summary className="cursor-pointer font-serif text-2xl text-deep">{title} · {rows.length}</summary>
      <div className="mt-3 grid gap-2">
        {rows.map((row) => <div key={row.id}>{render(row)}</div>)}
      </div>
    </details>
  );
}

function ResultLine({ row, label, extra }: { row: { id: string; title: string; when: string; detail?: string }; label: string; extra?: ReactNode }) {
  const date = row.when ? row.when.slice(0, 16).replace("T", " ") : "No date";
  return (
    <details className="rounded-xl border border-line px-3 py-2 text-sm">
      <summary className="cursor-pointer">
        <span className="font-medium">{row.title}</span>
        <span className="mt-0.5 block text-muted">{label} · {date} · <StatusPill status={label.toLowerCase()} /></span>
      </summary>
      <div className="mt-2 grid gap-2">
        {row.detail ? <p className="whitespace-pre-line text-sm text-muted">{row.detail}</p> : null}
        {extra}
      </div>
    </details>
  );
}

const DECLINE_CODES = [
  ["D01", "Harmful, abusive or disrespectful"],
  ["D02", "Discriminatory or hateful"],
  ["D03", "Illegal goods, services or activity"],
  ["D04", "Misleading, scam or fraudulent"],
  ["D05", "Personal data or privacy breach"],
  ["D06", "Copyright or ownership issue"],
  ["D07", "Incomplete or inaccurate information"],
  ["D08", "Off-topic or against the rules"],
  ["D09", "Low quality"],
  ["D10", "Other"],
];

function Decision({ title, detail, publisher, waiting, onDecide }: { title: string; detail: string; checklist?: boolean; publisher: boolean; waiting?: boolean; onDecide: (status: "published" | "changes_requested" | "refused", reason: string, checks: string[]) => void }) {
  const [checks, setChecks] = useState({ accurate: false, safe: false, contact: false, layout: false, rules: false });
  const [code, setCode] = useState("D07");
  const [reason, setReason] = useState("");
  const [needReason, setNeedReason] = useState(false);
  const [confirmDecline, setConfirmDecline] = useState(false);
  const ready = Object.values(checks).every(Boolean);
  function set(key: keyof typeof checks, value: boolean) { setChecks((current) => ({ ...current, [key]: value })); }
  function hold(status: "published" | "changes_requested" | "refused") {
    if (!reason.trim()) { setNeedReason(true); return; }
    const note = status === "published" ? reason.trim() : `${code}: ${reason.trim()}`;
    const summary = ["Details are accurate", "Safe and lawful", "Contact details work", "Page is laid out correctly", "Follows the community rules"].map((label, index) => `${label}: ${Object.values(checks)[index] ? "Passed" : "Failed"}`);
    onDecide(status, note, summary);
  }
  return (
    <article className="rounded-2xl border border-line bg-white p-4">
      <h2 className="font-semibold">{title}</h2>
      {detail ? <p className="mt-1 text-sm text-muted">{detail}</p> : null}
      <div className="mt-3 grid gap-2">
        <Toggle label="Details are accurate" checked={checks.accurate} onChange={(value) => set("accurate", value)} />
        <Toggle label="Safe and lawful" checked={checks.safe} onChange={(value) => set("safe", value)} />
        <Toggle label="Contact details work" checked={checks.contact} onChange={(value) => set("contact", value)} />
        <Toggle label="Page is laid out correctly" checked={checks.layout} onChange={(value) => set("layout", value)} />
        <Toggle label="Follows the community rules" checked={checks.rules} onChange={(value) => set("rules", value)} />
      </div>
      <label className="mt-3 grid gap-1 text-sm">Decline code
        <select className="min-h-11 rounded-xl border border-line px-3" value={code} onChange={(event) => setCode(event.target.value)}>{DECLINE_CODES.map(([id, label]) => <option key={id} value={id}>{id} · {label}</option>)}</select>
      </label>
      <label className="mt-3 grid gap-1 text-sm">Decision comment, sent to the owner<textarea rows={3} value={reason} onChange={(event) => { setReason(event.target.value); setNeedReason(false); }} className="rounded-xl border border-line px-3 py-2" /></label>
      {needReason ? <p className="mt-2 text-sm text-warn">A decision comment is required.</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={!ready} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-40" onClick={() => hold("published")}>{publisher ? "Approve" : "Submit approval"}</button>
        <button type="button" className="rounded-full border border-line px-4 py-2 text-sm" onClick={() => hold("changes_requested")}>{publisher ? "Amendment" : "Submit amendment"}</button>
        <button type="button" className="rounded-full border border-[#8A1C1C] px-4 py-2 text-sm text-[#8A1C1C]" onClick={() => { if (!reason.trim()) { setNeedReason(true); return; } setConfirmDecline(true); }}>{publisher ? "Decline" : "Submit decline"}</button>
      </div>
      {confirmDecline ? (
        <div className="mt-3 rounded-xl border border-[#8A1C1C] bg-[#FBE3E3] p-3">
          <p className="text-sm font-medium text-[#8A1C1C]">Decline {title}?</p>
          <p className="mt-1 text-xs text-[#8A1C1C]">The owner will be told and the page will stay hidden.</p>
          <div className="mt-2 flex gap-2">
            <button type="button" className="rounded-full bg-[#8A1C1C] px-3 py-1.5 text-sm text-white" onClick={() => { hold("refused"); setConfirmDecline(false); }}>Decline</button>
            <button type="button" className="rounded-full border border-line px-3 py-1.5 text-sm" onClick={() => setConfirmDecline(false)} autoFocus>Cancel</button>
          </div>
        </div>
      ) : null}
      {!ready ? <p className="mt-2 text-xs text-muted">Switch on every check before approving.</p> : null}
      {waiting && !publisher ? <p className="mt-2 text-sm text-muted">Sent to the super user. It stays unpublished until they decide.</p> : null}
      {code === "D02" || code === "D03" ? <p className="mt-2 text-xs text-muted">This code hides the item and opens a safeguarding case. The notice stays neutral.</p> : null}
      <div className="mt-4 border-t border-[#E8EDE9] pt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#5C6F64]">Linked records</p>
        <p className="mt-2 text-xs text-muted">Owner, related events and reports will appear here once the database is live. Live counts come from the counts module once it is live.</p>
      </div>
      <p className="mt-2 text-xs text-muted">Staff notifications open this drawer directly after sign-in.</p>
    </article>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  
  const [evidence, setEvidence] = useState<{ id: string; business_id: string; evidence_url: string; notes: string; submitted_at: string }[]>([]);
  useEffect(() => {
    fetch("/api/verification").then((r) => r.json()).then(setEvidence).catch(() => {});
  }, []);

  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-6 w-11 rounded-full ${checked ? "bg-primary" : "bg-line"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? "left-5" : "left-0.5"}`} />
      </button>
    </label>
  );
}
