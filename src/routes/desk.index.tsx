import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { deskAllows, useDeskSeat } from "@/components/desk/DeskFrame";
import { deskSignIn } from "@/lib/common/desk-auth";

export const Route = createFileRoute("/desk/")({ component: DeskHome });

const KEY = "common-desk";

function DeskHome() {
  const { seat, ready } = useDeskSeat();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNote("");
    const result = await deskSignIn({ data: { email, password } });
    setBusy(false);
    if (!result.ok) {
      setNote("That email or password is not a staff seat.");
      return;
    }
    sessionStorage.setItem(KEY, result.token);
    window.location.assign("/desk");
  }

  if (!ready) return null;
  if (!seat) {
    return (
      <div className="mx-auto max-w-md">
        <p className="text-xs tracking-wide text-muted">
          <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">Staff</span>
          Super user only
        </p>
        <h1 className="mt-2 break-words font-serif text-3xl leading-tight text-deep">Staff sign in</h1>
        <p className="mt-2 text-sm text-muted">
          This sign-in is only for the super user. Everyone else uses the account they registered. The Staff desks link appears on that profile only after the super user allocates a desk.
        </p>
        <form onSubmit={submit} className="mt-6 grid gap-3">
          <label className="grid gap-1 text-sm">
            Email
            <input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required className="min-h-11 rounded-xl border border-line bg-white px-3" />
          </label>
          <label className="grid gap-1 text-sm">
            Password
            <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required className="min-h-11 rounded-xl border border-line bg-white px-3" />
          </label>
          {note ? <p className="text-sm text-warn">{note}</p> : null}
          <button type="submit" disabled={busy} className="min-h-11 rounded-full bg-primary px-4 text-sm font-medium text-white disabled:opacity-50">
            {busy ? "Checking…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs tracking-wide text-muted">
        <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">{seat.role === "super" ? "Super user" : "Staff"}</span>
        Desks
      </p>
      <h1 className="mt-2 break-words font-serif text-3xl leading-tight text-deep">Today</h1>
      <p className="mt-1 text-sm text-muted">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })} · All of Lambeth</p>
      {seat.role === "super" ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3"><p className="text-xs font-semibold uppercase tracking-wide text-[#5C6F64]">SLA health</p><p className="mt-1 text-2xl font-bold text-[#306830]">–</p></div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3"><p className="text-xs font-semibold uppercase tracking-wide text-[#5C6F64]">Alerts unread</p><p className="mt-1 text-2xl font-bold text-[#102820]">–</p></div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3"><p className="text-xs font-semibold uppercase tracking-wide text-[#5C6F64]">Approvals for me</p><p className="mt-1 text-2xl font-bold text-[#102820]">–</p></div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3"><p className="text-xs font-semibold uppercase tracking-wide text-[#5C6F64]">High severity open</p><p className="mt-1 text-2xl font-bold text-[#8A1C1C]">–</p></div>
        </div>
      ) : null}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {seat.role === "super" ? <Level href="/desk/users" label="Super" title="Users" body="Search, edit and allocate a prepared shop or event after the agreement is signed." /> : null}
        {deskAllows(seat, "admin") ? <Level href="/desk/admin" label="Staff" title="Admin" body="Verification, news, harm reports and appeals." /> : null}
        {deskAllows(seat, "business") ? <Level href="/desk/business" label="Shops" title="Business" body="Pages, events and listings. The door counts a ticket already issued." /> : null}
        {deskAllows(seat, "council") ? <Level href="/desk/council" label="Partner" title="Council" body="Neighbourhood counts and incident notes on this browser." /> : null}
        {seat.role === "super" || seat.email ? <Level href="/desk/charity" label="Charity" title="Charity" body="Reserved for a charity group. Nothing is public yet." /> : null}
        {seat.role === "super" ? <Level href="/desk/journalist" label="Press" title="Journalist" body="Reserved for a journalist. A story still waits for a person." /> : null}
        {seat.role === "super" ? <Level href="/desk/author" label="Press" title="News author" body="Reserved for a news author. Nothing publishes itself." /> : null}
      </div>
    </div>
  );
}

function Level({ href, label, title, body }: { href: "/desk/admin" | "/desk/business" | "/desk/council" | "/desk/users" | "/desk/charity" | "/desk/journalist" | "/desk/author"; label: string; title: string; body: string }) {
  return (
    <Link to={href} search={href === "/desk/admin" ? { section: "", item: "" } : undefined} className="rounded-2xl border border-line bg-white p-5 shadow-[0_10px_30px_-24px_rgba(16,40,32,0.6)]">
      <p className="text-xs tracking-wide text-muted">
        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">{label}</span>
      </p>
      <h2 className="mt-2 break-words font-serif text-2xl leading-tight text-deep">{title}</h2>
      <p className="mt-2 text-sm text-muted">{body}</p>
    </Link>
  );
}
