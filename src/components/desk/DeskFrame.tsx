import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, Building2, Calendar, Landmark, Megaphone, Newspaper, PoundSterling, Shield, ShieldAlert, Store, Ticket, Users, MapPin, FileText, Settings, UserCheck } from "lucide-react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { deskWho, type DeskSeat } from "@/lib/common/desk-auth";
import { dutiesFor, SUPER_EMAIL, type StaffDuty } from "@/lib/common/staff";
import { useCommon } from "@/lib/common/store";

const KEY = "common-desk";

type DeskContextValue = {
  seat: DeskSeat | null;
  ready: boolean;
  signOut: () => void;
};

const DeskContext = createContext<DeskContextValue>({
  seat: null,
  ready: false,
  signOut: () => {},
});

export function useDeskSeat() {
  return useContext(DeskContext);
}

const links: { to: string; label: string; icon: typeof Users; search?: Record<string, string>; match: (path: string) => boolean }[] = [
  { to: "/desk/admin", label: "Overview", icon: BarChart3, search: { section: "", item: "" }, match: (path) => path === "/desk" || path.startsWith("/desk/admin") },
  { to: "/desk/queues", label: "Queues", icon: Shield, match: (path) => path.startsWith("/desk/queues") },
  { to: "/desk/places", label: "Places", icon: MapPin, match: (path) => path.startsWith("/desk/places") },
  { to: "/desk/content", label: "Content", icon: FileText, match: (path) => path.startsWith("/desk/content") },
  { to: "/desk/settings", label: "Settings", icon: Settings, match: (path) => path.startsWith("/desk/settings") },
  { to: "/desk/moderator", label: "Moderator", icon: UserCheck, match: (path) => path.startsWith("/desk/moderator") },
  { to: "/desk/safeguarding", label: "Safety", icon: ShieldAlert, match: (path) => path.startsWith("/desk/safeguarding") },
  { to: "/desk/users", label: "People", icon: Users, match: (path) => path.startsWith("/desk/users") },
  { to: "/desk/services", label: "Places", icon: Landmark, match: (path) => path.startsWith("/desk/services") },
  { to: "/desk/journalist", label: "Content", icon: Newspaper, match: (path) => path.startsWith("/desk/journalist") },
  { to: "/desk/admin", label: "Settings", icon: Shield, search: { section: "", item: "" }, match: (path) => path.startsWith("/desk/admin") },
];

export function deskAllows(seat: DeskSeat | null, duty: StaffDuty) {
  if (!seat) return false;
  if (seat.role === "super") return true;
  return seat.duties.includes(duty);
}

export function DeskFrame({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const account = useCommon((state) => state.account);
  const grants = useCommon((state) => state.staffGrants);
  const [seat, setSeat] = useState<DeskSeat | null>(null);
  const [passwordSession, setPasswordSession] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancel = false;
    const fromAccount = (): DeskSeat | null => {
      const duties = dutiesFor(account?.email, grants ?? []);
      if (!account?.email || duties.length === 0) return null;
      const email = account.email.trim().toLowerCase();
      return { email, role: email === SUPER_EMAIL ? "super" : "staff", duties };
    };
    const token = sessionStorage.getItem(KEY);
    if (!token) {
      setPasswordSession(false);
      setSeat(fromAccount());
      setReady(true);
      return;
    }
    void deskWho({ data: { token } }).then((who) => {
      if (cancel) return;
      if (!who) sessionStorage.removeItem(KEY);
      setPasswordSession(Boolean(who));
      setSeat(who ?? fromAccount());
      setReady(true);
    });
    return () => {
      cancel = true;
    };
  }, [account, grants]);

  function signOut() {
    sessionStorage.removeItem(KEY);
    setPasswordSession(false);
    const duties = dutiesFor(account?.email, grants ?? []);
    if (!account?.email || duties.length === 0) {
      setSeat(null);
      return;
    }
    const email = account.email.trim().toLowerCase();
    setSeat({ email, role: email === SUPER_EMAIL ? "super" : "staff", duties });
  }

  const [menuOpen, setMenuOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const councilOnly = seat?.role !== "super" && !seat?.duties.includes("admin") && (seat?.duties.includes("council") || account?.kind === "council" || account?.kind === "council_partner");
  const visible = councilOnly ? links.filter((link) => link.to === "/desk/council" || link.to === "/desk/services") : links;
  const roleLabel = seat?.role === "super" ? "Super Administrator" : seat?.duties.includes("admin") ? "Admin" : "Staff";

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === "/") { e.preventDefault(); document.querySelector<HTMLInputElement>("input[type=search]")?.focus(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <DeskContext.Provider value={{ seat, ready, signOut }}>
      <div className="min-h-screen bg-bg text-fg">
        <div className="flex min-h-screen">
          {/* Desktop rail */}
          <aside className="hidden w-[220px] shrink-0 flex-col bg-[#102820] text-white md:flex">
            <div className="px-4 py-4">
              <p className="text-[11px] font-semibold tracking-wide text-[#C9D3CC]">STAFF DESK</p>
            </div>
            <nav className="grid gap-0.5 px-2">
              {visible.map((link) => {
                const Icon = link.icon;
                const active = link.match(path);
                return (
                  <Link key={link.to} to={link.to as "/desk"} search={link.search as never} className={`flex h-10 items-center gap-2 rounded-lg px-3 text-sm ${active ? "bg-[#003820] border-l-[3px] border-[#F8B830]" : "hover:bg-white/5"}`}>
                    <Icon size={18} strokeWidth={2} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
          <main className="min-w-0 flex-1">
            {/* Top bar */}
            <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#E8EDE9] bg-white px-4">
              <div className="flex items-center gap-3">
                <button type="button" className="grid h-8 w-8 place-items-center rounded-lg border border-line md:hidden" onClick={() => setRailOpen(true)} aria-label="Open menu">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
                </button>
                <Link to="/" search={{ keep: "" }}><img src="/brand/logo.png" alt="The Common – Our place, our people" className="h-9 w-auto" /></Link>
              </div>
              <div className="hidden items-center gap-2 md:flex">
                <select className="h-9 rounded-lg border border-[#E8EDE9] px-2 text-sm" aria-label="Area filter">
                  <option>All Lambeth</option>
                  <option>Clapham</option>
                  <option>Brixton</option>
                  <option>Streatham</option>
                  <option>Vauxhall</option>
                  <option>Herne Hill</option>
                </select>
              </div>
              <div className="hidden flex-1 px-4 md:block">
                <input type="search" placeholder="Search people, businesses, events, cases or IDs" className="h-9 w-full max-w-xs rounded-lg border border-[#E8EDE9] px-3 text-sm" />
              </div>
              <div className="relative">
                <button type="button" className="flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-sm" onClick={() => setMenuOpen((v) => !v)}>
                  {roleLabel}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </button>
                {menuOpen ? (
                  <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-line bg-white py-1 shadow-lg">
                    <Link to="/account" search={{ next: "/desk" }} className="block px-3 py-2 text-sm hover:bg-band" onClick={() => setMenuOpen(false)}>Profile</Link>
                    <Link to="/" search={{ keep: "" }} className="block px-3 py-2 text-sm hover:bg-band" onClick={() => setMenuOpen(false)}>Back to the app</Link>
                    <button type="button" className="block w-full px-3 py-2 text-left text-sm hover:bg-band" onClick={() => { signOut(); setMenuOpen(false); }}>Sign out</button>
                  </div>
                ) : null}
              </div>
            </header>
            {/* Mobile rail drawer */}
            {railOpen ? (
              <div className="fixed inset-0 z-30 md:hidden">
                <div className="absolute inset-0 bg-black/40" onClick={() => setRailOpen(false)} />
                <aside className="absolute left-0 top-0 flex h-full w-[220px] flex-col bg-[#102820] text-white">
                  <div className="flex items-center justify-between px-4 py-4">
                    <p className="text-[11px] font-semibold tracking-wide text-[#C9D3CC]">STAFF DESK</p>
                    <button type="button" className="text-white" onClick={() => setRailOpen(false)} aria-label="Close">✕</button>
                  </div>
                  <nav className="grid gap-0.5 px-2">
                    {visible.map((link) => {
                      const Icon = link.icon;
                      const active = link.match(path);
                      return (
                        <Link key={link.to} to={link.to as "/desk"} search={link.search as never} onClick={() => setRailOpen(false)} className={`flex h-10 items-center gap-2 rounded-lg px-3 text-sm ${active ? "bg-[#003820] border-l-[3px] border-[#F8B830]" : "hover:bg-white/5"}`}>
                          <Icon size={18} strokeWidth={2} />
                          {link.label}
                        </Link>
                      );
                    })}
                  </nav>
                </aside>
              </div>
            ) : null}
            <div className="px-4 py-5 md:px-8">
              {ready ? children : <p className="text-sm text-muted">Checking the desk…</p>}
            </div>
          </main>
        </div>
      </div>
    </DeskContext.Provider>
  );
}

export function DeskLocked() {
  return (
    <div className="max-w-lg">
      <p className="text-xs tracking-wide text-muted">
        <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">Staff</span> Closed
      </p>
      <h1 className="mt-2 break-words font-serif text-3xl leading-tight text-deep">You don't have access</h1>
      <p className="mt-2 text-sm text-muted">Ask the super user if you need this desk.</p>
      <Link to="/desk" className="mt-4 inline-block text-sm font-medium text-primary">Back to the overview</Link>
    </div>
  );
}

export function DeskDenied() {
  return (
    <div className="max-w-lg">
      <p className="text-xs tracking-wide text-muted">
        <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">Staff</span>
        Not allocated
      </p>
      <h1 className="mt-2 break-words font-serif text-3xl leading-tight text-deep">Not on your allocation</h1>
      <p className="mt-2 text-sm text-muted">You don't have access to this page. Ask the super user if you need it.</p>
      <Link to="/desk" className="mt-4 inline-block text-sm font-medium text-primary">Back to the overview</Link>
    </div>
  );
}
