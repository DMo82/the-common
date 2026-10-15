import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, Building2, Calendar, Landmark, Megaphone, Newspaper, PoundSterling, Shield, ShieldAlert, Store, Ticket, Users } from "lucide-react";
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
  { to: "/desk/users", label: "Users", icon: Users, match: (path) => path.startsWith("/desk/users") },
  { to: "/desk/admin", label: "Admin", icon: Shield, search: { section: "", item: "" }, match: (path) => path.startsWith("/desk/admin") },
  { to: "/desk/safeguarding", label: "Safeguarding", icon: ShieldAlert, match: (path) => path.startsWith("/desk/safeguarding") },
  { to: "/desk/communication", label: "Communication", icon: Megaphone, match: (path) => path.startsWith("/desk/communication") },
  { to: "/desk/revenue", label: "Revenue", icon: PoundSterling, match: (path) => path.startsWith("/desk/revenue") },
  { to: "/desk/services", label: "Services", icon: Landmark, match: (path) => path.startsWith("/desk/services") },
  { to: "/desk/journalist", label: "Journalists", icon: Newspaper, match: (path) => path.startsWith("/desk/journalist") },
  { to: "/desk/charity", label: "Clubs", icon: Building2, match: (path) => path.startsWith("/desk/charity") },
  { to: "/desk/council", label: "Council", icon: BarChart3, match: (path) => path.startsWith("/desk/council") },
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

  const councilOnly = seat?.role !== "super" && !seat?.duties.includes("admin") && (seat?.duties.includes("council") || account?.kind === "council" || account?.kind === "council_partner");
  const visible = councilOnly ? links.filter((link) => link.to === "/desk/council" || link.to === "/desk/services") : links;
  const showDeskChips = ["/desk/admin", "/desk/users", "/desk/safeguarding", "/desk/communication", "/desk/revenue", "/desk/services"].includes(path);

  return (
    <DeskContext.Provider value={{ seat, ready, signOut }}>
      <div className="min-h-screen bg-bg text-fg">
        <div className="mx-auto flex min-h-screen max-w-7xl">
          <aside className={`${showDeskChips ? "hidden md:flex" : "hidden"} w-56 shrink-0 flex-col border-r border-line bg-white`}>
            <div className="border-b border-line px-5 py-5">
              <Link to="/" search={{ keep: "" }}><img src="/brand/logo.png" alt="" className="h-10 w-auto" /></Link>
              <p className="mt-3 font-serif text-lg leading-tight text-deep">Staff desks</p>
              <p className="text-xs text-muted">Desktop</p>
            </div>
            <nav className="grid gap-1 p-3">
              {visible.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-xl px-3 py-2 text-sm ${link.match(path) ? "bg-primary text-on-primary" : "text-fg hover:bg-band"}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto grid gap-2 p-4 text-xs text-muted">
              {seat ? <p className="break-all">{seat.email}</p> : <p>Not signed in</p>}
              {seat?.role === "super" && passwordSession ? (
                <button type="button" className="text-left font-medium text-primary" onClick={signOut}>
                  Sign out
                </button>
              ) : null}
              <Link to="/" search={{ keep: "" }} className="font-medium text-primary">Back to the app</Link>
            </div>
          </aside>
          <main className="min-w-0 flex-1">
            <header className="sticky top-0 z-10 border-b border-line/80 bg-white/90 backdrop-blur-md">
              <div className="grid h-14 grid-cols-[auto_1fr_auto] items-center gap-2 px-3">
                <Link to="/" search={{ keep: "" }}><img src="/brand/logo.png" alt="The Common" className="h-8 w-auto max-w-16 object-contain" /></Link>
                <div className="min-w-0 text-center leading-none">
                  <p className="font-display text-[15px] font-semibold tracking-[-0.03em] text-deep">Lambeth</p>
                  <p className="mt-0.5 font-display text-[11px] font-semibold tracking-[0.04em] text-primary">Common Community</p>
                </div>
                <button type="button" aria-label="Back" className="grid h-7 w-7 place-items-center rounded-full border border-line bg-white text-sm" onClick={() => window.history.back()}>🔙</button>
              </div>
            </header>
            <div className="px-4 py-5 md:px-10">
            {showDeskChips ? (
            <div className="-mx-1 mb-4 flex min-w-0 flex-nowrap gap-1.5 overflow-x-auto px-1 pb-1">
              {visible.map((link) => {
                const Icon = link.icon;
                return (
                <Link key={link.to} to={link.to as "/desk"} search={link.search as never} className={`inline-flex h-7 shrink-0 items-center gap-1 rounded-full px-2 text-[11px] font-medium ${link.match(path) ? "bg-primary text-white" : "border border-line bg-white"}`}>
                  <Icon size={12} strokeWidth={1.75} />{link.label}
                </Link>
                );
              })}
            </div>
            ) : null}
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
        <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">Staff</span>
        Closed
      </p>
      <h1 className="mt-2 break-words font-serif text-3xl leading-tight text-deep">This desk is locked</h1>
      <p className="mt-2 text-sm text-muted">Staff desks only open for an account the super user has allocated. Each person sees the desks they were given, and nothing else.</p>
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
      <p className="mt-2 text-sm text-muted">The super user has not given this account that desk.</p>
      <Link to="/desk" className="mt-4 inline-block text-sm font-medium text-primary">Back to the overview</Link>
    </div>
  );
}
