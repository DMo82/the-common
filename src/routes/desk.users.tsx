import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { deskAllows, useDeskSeat } from "@/components/desk/DeskFrame";
import { SearchBox } from "@/components/common/SearchBox";
import { canAccess } from "@/lib/common/staff";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/desk/users")({ component: UsersDesk });

type LogKind = "all" | "messaging" | "comments" | "submissions";

function UsersDesk() {
  const account = useCommon((state) => state.account);
  const directory = useCommon((state) => state.directory ?? []);
  const businesses = useCommon((state) => state.businesses);
  const events = useCommon((state) => state.events);
  const listings = useCommon((state) => state.listings);
  const news = useCommon((state) => state.news);
  const { seat } = useDeskSeat();
  const superUser = canAccess(account?.email, account?.kind, "super");
  const admin = deskAllows(seat, "admin");
  const audit = useCommon((state) => state.audit ?? []);
  const messageLog = useCommon((state) => state.messageLog ?? []);
  const enquiries = useCommon((state) => state.enquiries);
  const ratings = useCommon((state) => state.ratings ?? []);
  const submissions = useCommon((state) => state.submissions ?? []);
  const [query, setQuery] = useState("");
  const [openEmail, setOpenEmail] = useState("");
  const [logQuery, setLogQuery] = useState({ name: "", user: "", from: "", to: "" });
  const [applied, setApplied] = useState<{ name: string; user: string; from: string; to: string } | null>(null);
  const [logNote, setLogNote] = useState("");
  const needle = query.trim().toLowerCase();
  const matches = directory.map((row) => {
    const id = (row.id || "").toLowerCase();
    const username = (row.username || row.email || "").toLowerCase();
    const fullName = `${row.name || ""} ${row.surname || ""}`.toLowerCase();
    const email = (row.email || "").toLowerCase();
    const fields = [fullName, username, email, id];
    if (!needle || !fields.some((field) => field.includes(needle))) return { row, score: 0 };
    const score = fields.reduce((best, field, index) => {
      if (field === needle) return Math.max(best, 100 - index);
      if (field.startsWith(needle)) return Math.max(best, 80 - index);
      if (field.includes(needle)) return Math.max(best, 40 - index);
      return best;
    }, 0);
    return { row, score };
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).map((item) => item.row);
  const allLogs = useMemo(() => {
    const titleFor = (id: string) => businesses.find((row) => row.id === id)?.name || events.find((row) => row.id === id)?.title || listings.find((row) => row.id === id)?.title || news.find((row) => row.id === id)?.title || id;
    const rows = [
      ...messageLog.map((row) => ({ id: row.id, at: row.at, kind: "messaging" as const, who: row.actor, action: row.action, target: titleFor(row.target), text: row.action, detail: `Action: ${row.action}\nTarget: ${titleFor(row.target)}\nMessage: ${row.body}` })),
      ...enquiries.map((row) => ({ id: row.id, at: row.at || "", kind: "messaging" as const, who: row.from, action: "Message", target: titleFor(row.businessId), text: "Message", detail: `Action: Message\nTo: ${titleFor(row.businessId)}\nMessage: ${row.body}` })),
      ...ratings.map((row, index) => ({ id: `rating-${index}`, at: "", kind: "comments" as const, who: row.accountName, action: "Rating", target: titleFor(row.businessId), text: `${row.stars} stars`, detail: `Action: Rating\nBusiness: ${titleFor(row.businessId)}\nStars: ${row.stars}` })),
      ...audit.filter((row) => /submit|comment|message|post|news|event|listing|business|edit|approv|refus/i.test(`${row.action} ${row.reason}`)).map((row) => ({
        id: row.id,
        at: row.at,
        kind: (/comment|rating/i.test(row.action) ? "comments" : /message/i.test(row.action) ? "messaging" : "submissions") as LogKind,
        who: row.actor,
        action: row.action,
        target: titleFor(row.target),
        text: row.action,
        detail: `Action: ${row.action}\nTarget: ${titleFor(row.target)}\n${row.reason ? `Detail: ${row.reason}` : "No further detail was recorded."}`,
      })),
      ...submissions.map((row) => ({ id: row.id, at: row.at, kind: "submissions" as const, who: row.by, action: "Submitted", target: titleFor(row.itemId), text: `Submitted ${row.kind}`, detail: `Action: Submitted for ${row.status}\nItem: ${titleFor(row.itemId)}\nType: ${row.kind}\n${row.reason ? `Note: ${row.reason}` : ""}` })),
    ];
    return rows.sort((a, b) => (b.at || "").localeCompare(a.at || ""));
  }, [messageLog, enquiries, ratings, audit, submissions, businesses, events, listings, news]);
  const matchedLogs = useMemo(() => {
    if (!applied) return [];
    const nameQuery = applied.name.trim().toLowerCase();
    const userQuery = applied.user.trim().toLowerCase();
    return allLogs.filter((row) => {
      const day = row.at.slice(0, 10);
      if (applied.from && (!day || day < applied.from)) return false;
      if (applied.to && (!day || day > applied.to)) return false;
      const personRow = directory.find((item) => (item.email || "").toLowerCase() === row.who.toLowerCase() || (item.name || "").toLowerCase() === row.who.toLowerCase());
      const username = (personRow?.username || personRow?.email || row.who).toLowerCase();
      const displayName = (personRow?.name || row.who).toLowerCase();
      if (userQuery && !username.includes(userQuery) && !row.who.toLowerCase().includes(userQuery)) return false;
      if (nameQuery && !displayName.includes(nameQuery) && !row.who.toLowerCase().includes(nameQuery)) return false;
      return true;
    });
  }, [allLogs, applied, directory]);

  if (!superUser && !admin) {
    return <p className="text-sm">This desk is for the super user and admin. <Link to="/desk" className="font-medium text-primary">Back to desks</Link></p>;
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      <div>
        <h1 className="font-serif text-3xl text-deep">Users</h1>
        <p className="mt-1 text-sm text-muted">Search by username or unique user id. Approvals, linked pages and the log stay on this desk.</p>
      </div>

      <details className="rounded-3xl border border-line bg-white p-4">
        <summary className="cursor-pointer font-serif text-2xl text-deep">Find a user</summary>
        <input className="mt-3 min-h-11 w-full rounded-xl border border-line px-3" value={query} onChange={(event) => { const value = event.target.value; setQuery(value); setOpenEmail(""); if (!value.trim()) { setLogQuery({ name: "", user: "", from: "", to: "" }); setApplied(null); } }} placeholder="Username or unique user id" />
        <div className="mt-3 grid gap-2">
          {(openEmail ? matches.filter((row) => row.email === openEmail) : matches).map((row) => {
            const rowEmail = (row.email || "").toLowerCase();
            const linked = (item: { ownerEmail?: string; staff?: { email: string }[] }) =>
              Boolean(rowEmail) && ((item.ownerEmail || "").toLowerCase() === rowEmail || (item.staff ?? []).some((member) => member.email.toLowerCase() === rowEmail));
            return (
              <details key={row.email} className="rounded-2xl border border-line px-3 py-2 text-sm" open={openEmail === row.email} onToggle={(event) => { if (event.target !== event.currentTarget) return; const open = (event.currentTarget as HTMLDetailsElement).open; setOpenEmail(open ? row.email || "" : ""); if (open) { const today = new Date(); const from = new Date(today.getTime() - 30 * 86400000).toISOString().slice(0, 10); const to = today.toISOString().slice(0, 10); const next = { name: row.name || "", user: row.username || row.email || "", from, to }; setLogQuery(next); setApplied(next); setLogNote(""); } }}>
                <summary className="cursor-pointer">
                  <span className="font-medium">{row.name}</span>
                  <span className="mt-0.5 block text-muted">{row.username || row.email} · {row.id || "No id yet"}</span>
                </summary>
                <div className="mt-3 grid gap-3">
                  <p className="text-muted">{row.username || row.email} · {row.id || "No id yet"} · {(row.kind || "resident").replaceAll("_", " ")} · {row.approved === false ? "Not approved" : "Approved"} · {row.neighbourhood || "No home area"}</p>
                  <LinkedGroup title="Businesses" to="/business/$id" rows={businesses.filter(linked).map((item) => ({ id: item.id, label: item.name, detail: [item.about, item.address, item.postcode, item.email, item.status].filter(Boolean).join("\n") }))} empty="No business is linked to this user." />
                  <LinkedGroup title="Events" to="/event/$id" rows={events.filter(linked).map((item) => ({ id: item.id, label: item.title, detail: [item.when, item.place, item.address, item.detail, item.status].filter(Boolean).join("\n") }))} empty="No event is linked to this user." />
                  <LinkedGroup title="Marketplace listings" to="/listing/$id" rows={listings.filter(linked).map((item) => ({ id: item.id, label: item.title, detail: [item.detail, item.priceLabel, item.status].filter(Boolean).join("\n") }))} empty="No listing is linked to this user." />
                </div>
              </details>
            );
          })}
          {needle && matches.length === 0 ? <p className="text-sm text-muted">No user matches that username or id.</p> : null}
          {!needle ? <p className="text-sm text-muted">Names stay hidden until you search.</p> : null}
        </div>
      </details>

      <details className="rounded-3xl border border-line bg-white p-4">
        <summary className="cursor-pointer font-serif text-2xl text-deep">Allocate</summary>
        <div className="mt-3"><AllocateMatch actor={seat?.email || ""} /></div>
      </details>

      <details className="rounded-3xl border border-line bg-white p-4">
        <summary className="cursor-pointer font-serif text-2xl text-deep">User log</summary>
        <div className="mt-3 grid gap-3">
          <SearchBox
            values={logQuery}
            onChange={setLogQuery}
            labels={{ name: "Name", namePlaceholder: "Full name", user: "Username", userPlaceholder: "Email or username" }}
            onSearch={() => {
              if (!logQuery.from || !logQuery.to) { setLogNote("Choose a start date and an end date."); setApplied(null); return; }
              const span = (Date.parse(logQuery.to) - Date.parse(logQuery.from)) / 86400000;
              if (span < 0) { setLogNote("The end date is before the start date."); setApplied(null); return; }
              if (span > 30) { setLogNote("The range cannot be longer than 30 days."); setApplied(null); return; }
              setLogNote("");
              setApplied({ ...logQuery });
            }}
          />
          {logNote ? <p className="text-sm text-warn">{logNote}</p> : null}
          <div className="grid gap-2">
            {applied ? matchedLogs.slice(0, 20).map((row) => (
              <details key={row.id} className="rounded-xl border border-line px-3 py-2 text-sm">
                <summary className="cursor-pointer">
                  <span className="font-medium">{row.action}</span>
                  <span className="mt-0.5 block text-muted">{row.at ? row.at.slice(0, 16).replace("T", " ") : "No date"} · {row.kind} · {row.who}</span>
                </summary>
                <p className="mt-2 whitespace-pre-line text-sm text-muted">{row.detail}</p>
              </details>
            )) : null}
            {applied && matchedLogs.length === 0 ? <p className="text-sm text-muted">No log lines in that range.</p> : null}
          </div>
          {applied && matchedLogs.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <button type="button" className="h-8 rounded-full border border-line px-3 text-xs font-medium" onClick={() => downloadFile(`user-log-${applied.from}-to-${applied.to}.csv`, "text/csv", toCsv(matchedLogs))}>Download CSV</button>
              <button type="button" className="h-8 rounded-full border border-line px-3 text-xs font-medium" onClick={() => downloadFile(`user-log-${applied.from}-to-${applied.to}.pdf`, "application/pdf", toPdf(`User log ${applied.from} to ${applied.to}`, matchedLogs))}>Download PDF</button>
            </div>
          ) : null}
        </div>
      </details>
    </div>
  );
}

function AllocateMatch({ actor }: { actor: string }) {
  const directory = useCommon((state) => state.directory ?? []);
  const businesses = useCommon((state) => state.businesses);
  const events = useCommon((state) => state.events);
  const listings = useCommon((state) => state.listings);
  const news = useCommon((state) => state.news);
  const transferOwnership = useCommon((state) => state.transferOwnership);
  const [userQuery, setUserQuery] = useState("");
  const [itemQuery, setItemQuery] = useState("");
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [item, setItem] = useState<{ kind: "business" | "event" | "listing" | "news"; id: string; name: string } | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [note, setNote] = useState("");
  const people = directory.filter((row) => `${row.name} ${row.surname || ""} ${row.username || ""} ${row.email || ""}`.toLowerCase().includes(userQuery.trim().toLowerCase()));
  const items = [
    ...businesses.map((row) => ({ kind: "business" as const, id: row.id, name: row.name })),
    ...events.map((row) => ({ kind: "event" as const, id: row.id, name: row.title })),
    ...listings.map((row) => ({ kind: "listing" as const, id: row.id, name: row.title })),
    ...news.map((row) => ({ kind: "news" as const, id: row.id, name: row.title })),
  ].filter((row) => row.name.toLowerCase().includes(itemQuery.trim().toLowerCase()));
  return (
    <div className="grid gap-3">
      <input value={userQuery} onChange={(event) => { setUserQuery(event.target.value); if (!event.target.value.trim()) setUser(null); }} placeholder="Search a user" className="min-h-11 rounded-xl border border-line px-3" />
      <div className="grid gap-1">
        {(user ? people.filter((row) => row.email === user.email) : userQuery.trim() ? people.slice(0, 8) : []).map((row) => (
          <button type="button" key={row.email} className={`rounded-xl border px-3 py-2 text-left text-sm ${user?.email === row.email ? "border-primary bg-band" : "border-line"}`} onClick={() => { setUser({ email: row.email || "", name: row.name }); setConfirm(false); }}>{row.name}<span className="mt-0.5 block text-muted">{row.username || row.email}</span></button>
        ))}
      </div>
      {user ? (
        <>
          <input value={itemQuery} onChange={(event) => { setItemQuery(event.target.value); if (!event.target.value.trim()) setItem(null); }} placeholder="Search a business, event, listing or news article" className="min-h-11 rounded-xl border border-line px-3" />
          <div className="grid gap-1">
            {(item ? items.filter((row) => row.id === item.id) : itemQuery.trim() ? items.slice(0, 8) : []).map((row) => (
              <button type="button" key={`${row.kind}-${row.id}`} className={`rounded-xl border px-3 py-2 text-left text-sm ${item?.id === row.id ? "border-primary bg-band" : "border-line"}`} onClick={() => { setItem(row); setConfirm(false); }}>{row.kind} · {row.name}</button>
            ))}
          </div>
        </>
      ) : null}
      {user && item ? (
        <div className="grid gap-2">
          <p className="rounded-xl bg-warn-bg px-3 py-2 text-sm text-warn">Warning: transferring changes who owns this. The current owner will lose control of it.</p>
          <button type="button" className="h-11 rounded-full bg-primary px-4 text-sm font-medium text-on-primary" onClick={() => setConfirm(true)}>Transfer</button>
        </div>
      ) : null}
      {confirm && user && item ? (
        <div className="grid gap-2 rounded-xl bg-warn-bg p-3 text-sm">
          <p>Are you sure you would like to make this change? This transfers {item.name} to {user.name}.</p>
          <div className="flex gap-2">
            <button type="button" className="h-9 rounded-full bg-primary px-3 text-xs font-medium text-on-primary" onClick={() => { setNote(transferOwnership(item.kind, item.id, user.email)); setConfirm(false); }}>Yes, change ownership</button>
            <button type="button" className="h-9 rounded-full border border-line px-3 text-xs font-medium" onClick={() => setConfirm(false)}>Cancel</button>
          </div>
        </div>
      ) : null}
      {note ? <p className="text-sm text-muted">{note} Recorded for {actor}.</p> : null}
    </div>
  );
}

function downloadFile(name: string, type: string, body: string | Uint8Array) {
  const blob = new Blob([body as BlobPart], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);
}

function toCsv(rows: { at: string; kind: string; who: string; action: string; detail: string }[]) {
  const lines = ["Date,Category,User,Action,Detail", ...rows.map((row) => [row.at, row.kind, row.who, row.action, row.detail].map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))];
  return lines.join("\n");
}

function toPdf(title: string, rows: { at: string; kind: string; who: string; action: string; detail: string }[]) {
  const lines = [title, ...rows.flatMap((row) => [`${row.at ? row.at.slice(0, 16).replace("T", " ") : "No date"}  ${row.kind}  ${row.who}  ${row.action}`, ...row.detail.split("\n"), ""])].map((line) => line.replace(/[()\\]/g, " ").slice(0, 110));
  const pages: string[] = [];
  for (let index = 0; index < lines.length; index += 48) {
    const slice = lines.slice(index, index + 48);
    pages.push(slice.map((line, lineIndex) => `BT /F1 10 Tf 40 ${760 - lineIndex * 14} Td (${line}) Tj ET`).join("\n"));
  }
  const objects: string[] = [];
  const fontId = 3 + pages.length * 2;
  objects.push("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj");
  objects.push(`2 0 obj << /Type /Pages /Count ${pages.length} /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ")}] >> endobj`);
  pages.forEach((content, index) => {
    const pageId = 3 + index * 2;
    const streamId = pageId + 1;
    objects.push(`${pageId} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${streamId} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >> endobj`);
    objects.push(`${streamId} 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`);
  });
  objects.push(`${fontId} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj`);
  let body = "%PDF-1.4\n";
  const offsets = objects.map((object) => { const offset = body.length; body += `${object}\n`; return offset; });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("")}`;
  body += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return body;
}

function LinkedGroup({ title, to, rows, empty }: { title: string; to: "/business/$id" | "/event/$id" | "/listing/$id"; rows: { id: string; label: string; detail: string }[]; empty: string }) {
  return (
    <div>
      <p className="text-sm font-medium">{title} · {rows.length}</p>
      <div className="mt-1 grid gap-1">
        {rows.length === 0 ? <p className="text-sm text-muted">{empty}</p> : rows.map((row) => (
          <details key={row.id} className="rounded-xl border border-line px-3 py-2">
            <summary className="cursor-pointer font-medium">{row.label}</summary>
            <p className="mt-2 whitespace-pre-line text-sm text-muted">{row.detail}</p>
            <Link to={to} params={{ id: row.id }} search={{ from: "" }} className="mt-2 inline-block text-sm font-medium text-primary">Open page</Link>
          </details>
        ))}
      </div>
    </div>
  );
}

function Linked({ title, rows, empty }: { title: string; rows: { id: string; label: string; meta: string }[]; empty: string }) {
  return (
    <div>
      <p className="text-sm font-medium">{title} · {rows.length}</p>
      <div className="mt-1 grid gap-1">
        {rows.length === 0 ? <p className="text-sm text-muted">{empty}</p> : rows.slice(0, 8).map((row) => <p key={row.id} className="text-sm">{row.label} <span className="text-muted">· {row.meta.replaceAll("_", " ")} · {row.id}</span></p>)}
      </div>
    </div>
  );
}
