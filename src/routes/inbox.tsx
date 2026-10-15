import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DateField } from "@/components/common/SearchBox";
import { Shell } from "@/components/common/Shell";
import { ownsRecord } from "@/lib/common/model";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/inbox")({ component: InboxPage });

type Folder = "" | "Business" | "Event" | "Marketplace" | "Council" | "App";

function InboxPage() {
  const account = useCommon((state) => state.account);
  const businesses = useCommon((state) => state.businesses);
  const events = useCommon((state) => state.events);
  const enquiries = useCommon((state) => state.enquiries);
  const listingMessages = useCommon((state) => state.listingMessages ?? []);
  const listings = useCommon((state) => state.listings);
  const councilNotes = useCommon((state) => state.councilNotes ?? []);
  const incidents = useCommon((state) => state.incidents ?? []);
  const replyEnquiry = useCommon((state) => state.replyEnquiry);
  const markEnquiryRead = useCommon((state) => state.markEnquiryRead);
  const replyListing = useCommon((state) => state.replyListing);
  const markListingRead = useCommon((state) => state.markListingRead);
  const deleteMessages = useCommon((state) => state.deleteMessages);
  const reportMessage = useCommon((state) => state.reportMessage);
  const [filters, setFilters] = useState({ name: "", user: "", from: "", to: "" });
  const [folder, setFolder] = useState<Folder>("");
  const [folderOpen, setFolderOpen] = useState(false);
  const [open, setOpen] = useState("");
  const [draft, setDraft] = useState("");
  const owned = businesses.filter((row) => ownsRecord(row, account));
  const ownedIds = new Set(owned.map((row) => row.id));

  if (!account) {
    return <Shell><h1 className="font-serif text-3xl text-deep">Inbox</h1><p className="mt-2 text-sm">Log in to read a reply.</p><Link to="/login" search={{ next: "/inbox" }} className="mt-3 inline-block text-sm font-medium text-primary">Log in</Link></Shell>;
  }

  const notes = [
    ...enquiries.filter((row) => ownedIds.has(row.businessId) || row.from === account.name || row.from === "Admin").map((row) => {
      const app = row.from === "Admin" || row.body.startsWith("Decision:");
      const kind: Folder = app ? "App" : row.eventId ? "Event" : "Business";
      return { ...row, kind, title: events.find((item) => item.id === row.eventId)?.title || businesses.find((item) => item.id === row.businessId)?.name || "Message", listing: false };
    }),
    ...listingMessages.filter((row) => row.from === account.name || ownedIds.has(listings.find((item) => item.id === row.listingId)?.businessId || "")).map((row) => ({ ...row, kind: "Marketplace" as const, title: listings.find((item) => item.id === row.listingId)?.title || "Listing", businessId: "", listing: true })),
    ...councilNotes.filter((row) => row.name === account.name).map((row) => ({ id: row.id, at: row.at, from: "Council", body: row.body, reply: "", read: true, kind: "Council" as const, title: row.kind, businessId: "", listing: false })),
    ...incidents.filter((row) => row.name === account.name).map((row) => ({ id: row.id, at: row.at, from: "Council", body: row.description, reply: "", read: true, kind: "Council" as const, title: `${row.service} report`, businessId: "", listing: false })),
  ].sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")));

  const threads = new Map<string, typeof notes>();
  for (const row of notes) {
    const key = `${row.from}|||${row.title}`;
    threads.set(key, [...(threads.get(key) ?? []), row]);
  }
  const visible = [...threads.entries()].filter(([, rows]) => {
    if (folder && rows[0]?.kind !== folder) return false;
    const from = filters.from;
    const to = filters.to;
    return rows.some((row) => {
      const day = String(row.at || "").slice(0, 10);
      if (from && (!day || day < from)) return false;
      if (to && (!day || day > to)) return false;
      return true;
    });
  });
  const thread = threads.get(open);

  function openThread(key: string, rows: typeof notes) {
    setOpen(key);
    setDraft("");
    for (const row of rows) {
      if (row.listing) markListingRead(row.id);
      else markEnquiryRead(row.id);
    }
  }

  const folders: { id: Folder; label: string }[] = [
    { id: "", label: "All communications" },
    { id: "Business", label: "Business communications" },
    { id: "Event", label: "Event communications" },
    { id: "Marketplace", label: "Marketplace communications" },
    { id: "Council", label: "Council communications" },
    { id: "App", label: "App communications" },
  ];
  const unread = (id: Folder) => notes.filter((row) => (id ? row.kind === id : true) && row.read === false).length;
  const current = folders.find((item) => item.id === folder) || folders[0];

  return (
    <Shell>
      {thread ? (
        <div className="grid gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="font-serif text-3xl text-deep">{thread[0]?.from}</h1>
              <p className="text-sm text-muted">{thread[0]?.title} · {thread[0]?.kind}</p>
            </div>
            <button type="button" className="h-9 rounded-full border border-line px-3 text-sm font-medium" onClick={() => setOpen("")}>Return</button>
          </div>
          <div className="grid gap-2 rounded-3xl bg-[#f6f3ee] p-3">
            {thread.flatMap((row) => {
              const mine = row.from === account.name;
              const bubbles = [{ id: row.id, text: row.body, mine, at: row.at }];
              if (row.reply) bubbles.push({ id: `${row.id}-reply`, text: row.reply, mine: !mine, at: row.at });
              return bubbles;
            }).map((bubble) => (
              <div key={bubble.id} className={`flex ${bubble.mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${bubble.mine ? "rounded-br-sm bg-primary text-white" : "rounded-bl-sm bg-white text-fg"}`}>
                  <p className="whitespace-pre-line">{bubble.text}</p>
                  {bubble.at ? <p className={`mt-1 text-[10px] ${bubble.mine ? "text-white/70" : "text-muted"}`}>{bubble.at.slice(0, 16).replace("T", " ")}</p> : null}
                </div>
              </div>
            ))}
          </div>
          <form className="grid gap-2" onSubmit={(event) => { event.preventDefault(); if (!draft.trim() || !thread[0]) return; if (thread[0].listing) replyListing(thread[0].id, draft); else replyEnquiry(thread[0].id, draft); setDraft(""); }}>
            <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Reply" className="min-h-11 rounded-xl border border-line px-3" />
            <div className="flex flex-wrap gap-2">
              <button className="h-11 rounded-full bg-primary px-4 text-sm font-medium text-white">Send</button>
              <button type="button" className="h-11 rounded-full border border-line px-4 text-sm font-medium" onClick={() => { deleteMessages(thread.map((row) => row.id)); setOpen(""); }}>Delete</button>
              <button type="button" className="h-11 rounded-full bg-red-600 px-4 text-sm font-medium text-white" onClick={() => reportMessage({ target: thread[0]?.title || "Message", reason: "Flagged from inbox" })}>Flag</button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <h1 className="font-serif text-3xl text-deep">Inbox</h1>
          <p className="mt-1 text-sm text-muted">Tap a conversation to read it. You can reply, not start a new one.</p>
          <div className="mt-3 grid gap-2">
            <div className="relative">
              <button type="button" className="flex min-h-11 w-full items-center justify-between rounded-xl border border-line px-3 text-sm" onClick={() => setFolderOpen((value) => !value)}>
                <span>{current.label}</span>
                <span className="flex items-center gap-2">
                  {unread(folder) ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-medium text-white">{unread(folder)}</span> : null}
                  <span className="text-xs text-muted">{folderOpen ? "Hide" : "Show"}</span>
                </span>
              </button>
              {folderOpen ? (
                <div className="absolute z-10 mt-1 grid w-full gap-1 rounded-xl border border-line bg-white p-2 shadow">
                  {folders.map((item) => (
                    <button type="button" key={item.label} className={`flex items-center justify-between rounded-lg px-2 py-2 text-left text-sm ${folder === item.id ? "bg-band" : ""}`} onClick={() => { setFolder(item.id); setFolderOpen(false); }}>
                      <span>{item.label}</span>
                      {unread(item.id) ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-medium text-white">{unread(item.id)}</span> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="grid min-w-0 grid-cols-2 gap-2">
              <DateField label="From" value={filters.from} onChange={(value) => setFilters({ ...filters, from: value })} placeholder="Start date" />
              <DateField label="To" value={filters.to} onChange={(value) => setFilters({ ...filters, to: value })} placeholder="End date" />
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            {visible.length === 0 ? <p className="text-sm text-muted">Nothing in this folder.</p> : visible.map(([key, rows]) => (
              <button type="button" key={key} className="rounded-2xl border border-line px-3 py-2 text-left text-sm" onClick={() => openThread(key, rows)}>
                <span className="font-medium">{rows[0]?.from}</span>
                <span className="mt-0.5 block text-muted">{rows[0]?.kind} · {rows[0]?.title}</span>
                <span className="mt-0.5 block text-muted">{rows[0]?.body.slice(0, 80)}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </Shell>
  );
}