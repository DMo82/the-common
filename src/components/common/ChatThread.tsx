import { useState } from "react";

type Note = { id: string; from: string; body: string; reply: string; at?: string; read?: boolean };

function initial(name: string) {
  return (name.trim()[0] || "?").toUpperCase();
}

function stamp(at?: string) {
  if (!at) return "";
  const date = new Date(at);
  if (Number.isNaN(date.getTime())) return at.slice(0, 16).replace("T", " ");
  return date.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function Bubble({ text, mine, at, read }: { text: string; mine?: boolean; at?: string; read?: boolean }) {
  return (
    <div className={mine ? "ml-auto max-w-[85%]" : "max-w-[85%]"}>
      <p className={`rounded-2xl px-3 py-2 text-sm leading-6 ${mine ? "rounded-br-md bg-primary text-white" : "rounded-bl-md bg-white shadow-sm"}`}>{text}</p>
      <p className={`mt-1 flex items-center gap-1 text-[10px] text-muted ${mine ? "justify-end" : ""}`}>
        <span>{stamp(at)}</span>
        {read ? <span aria-label="Read" className="text-[#1f7a45]">✓</span> : null}
      </p>
    </div>
  );
}

export function ChatThread({ notes, onReply }: { notes: Note[]; onReply?: (id: string, reply: string) => void }) {
  const [open, setOpen] = useState("");
  const [draft, setDraft] = useState("");
  const people = [...new Set(notes.map((row) => row.from))];
  const thread = notes.filter((row) => row.from === open);
  if (!notes.length) return <p className="rounded-2xl bg-band px-3 py-4 text-sm text-muted">No conversation yet.</p>;
  if (open) {
    return (
      <div className="grid gap-3">
        <button type="button" aria-label="Back" className="grid h-7 w-7 place-items-center rounded-full border border-line bg-white text-sm" onClick={() => setOpen("")}>🔙</button>
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-medium text-white">{initial(open)}</span>
          <p className="font-medium text-deep">{open}</p>
        </div>
        <div className="grid gap-2 rounded-3xl bg-[#f6f3ee] p-3">
          {thread.map((row) => (
            <div key={row.id} className="grid gap-2">
              <Bubble text={row.body} at={row.at} read={row.read} />
              {row.reply ? <Bubble text={row.reply} mine at={row.at} read={row.read} /> : null}
            </div>
          ))}
        </div>
        {onReply ? <form className="flex gap-2 pb-[env(keyboard-inset-height,0px)]" onSubmit={(event) => { event.preventDefault(); const row = thread[0]; if (!row || !draft.trim()) return; onReply(row.id, draft); setDraft(""); }}><input value={draft} onChange={(event) => setDraft(event.target.value)} onFocus={(event) => event.currentTarget.scrollIntoView({ block: "center", behavior: "smooth" })} placeholder="Write a reply" className="min-h-11 flex-1 rounded-full border border-line bg-white px-4" /><button className="min-h-11 rounded-full bg-primary px-4 text-sm text-white">Send</button></form> : null}
      </div>
    );
  }
  return (
    <div className="grid gap-2">
      {people.map((name) => {
        const latest = notes.find((row) => row.from === name);
        return latest ? (
          <button type="button" key={name} className="flex min-h-11 items-center gap-3 rounded-2xl border border-line bg-white p-3 text-left" onClick={() => setOpen(name)}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-band text-sm font-medium text-deep">{initial(name)}</span>
            <span className="min-w-0"><span className="block text-sm font-medium">{name}</span><span className="block truncate text-sm text-muted">{latest.body}</span></span>
          </button>
        ) : null;
      })}
    </div>
  );
}
