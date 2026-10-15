import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Landmark, Mail, Newspaper, ShoppingBag, Store, UserRound } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { ownsRecord } from "@/lib/common/model";
import { useCommon } from "@/lib/common/store";

const tabs = [
  { to: "/", label: "News", icon: Newspaper, match: (path: string) => path === "/", search: { keep: "" } },
  { to: "/events", label: "Events", icon: CalendarDays, match: (path: string) => path.startsWith("/event"), search: { business: "", mine: "", keep: "" } },
  { to: "/businesses", label: "Business", icon: Store, match: (path: string) => path.startsWith("/business"), search: { keep: "" } },
  { to: "/market", label: "Marketplace", icon: ShoppingBag, match: (path: string) => path.startsWith("/market") || path.startsWith("/listing"), search: { business: "", mine: "", create: "", keep: "" } },
  { to: "/services", label: "Services", icon: Landmark, match: (path: string) => path.startsWith("/services") },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const searchStr = useRouterState({ select: (state) => state.location.searchStr });
  const account = useCommon((state) => state.account);
  const businesses = useCommon((state) => state.businesses);
  const enquiries = useCommon((state) => state.enquiries);
  const listings = useCommon((state) => state.listings);
  const listingMessages = useCommon((state) => state.listingMessages ?? []);
  const notifications = useCommon((state) => state.notifications ?? []);
  const ownedIds = new Set(businesses.filter((row) => ownsRecord(row, account)).map((row) => row.id));
  const noteCount = account ? notifications.filter((row) => !row.read && ((row.forRole === "journalist" && row.forName === account.name) || (row.forRole === "admin" && (account.email?.toLowerCase() === "dvmorris.dm@gmail.com" || account.kind === "author")))).length : 0;
  const unread = account ? enquiries.filter((row) => row.read === false && (ownedIds.has(row.businessId) || row.from === account.name)).length + listingMessages.filter((row) => row.read === false && (row.from === account.name || ownedIds.has(listings.find((item) => item.id === row.listingId)?.businessId || ""))).length : 0;
  const cookieChoice = useCommon((state) => state.cookieChoice);
  const setCookieChoice = useCommon((state) => state.setCookieChoice);
  const noteMeasure = useCommon((state) => state.noteMeasure);
  useEffect(() => {
    if (cookieChoice === "measures") noteMeasure("views");
  }, [path, cookieChoice, noteMeasure]);
  useEffect(() => {
    let frame = 0;
    const lift = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const viewport = window.visualViewport;
        const overlap = viewport ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop) : 0;
        document.body.style.paddingBottom = overlap ? `${overlap + 16}px` : "";
        const field = document.activeElement;
        if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) return;
        const box = field.getBoundingClientRect();
        const limit = (viewport?.height || window.innerHeight) - 24;
        if (box.bottom > limit || box.top < 12) field.scrollIntoView({ block: "center", behavior: "auto" });
      });
    };
    window.visualViewport?.addEventListener("resize", lift);
    document.addEventListener("focusin", lift);
    return () => {
      cancelAnimationFrame(frame);
      window.visualViewport?.removeEventListener("resize", lift);
      document.removeEventListener("focusin", lift);
      document.body.style.paddingBottom = "";
    };
  }, []);
  const here = `${path}${searchStr}`;
  const next = path.startsWith("/account") || path.startsWith("/login") || path.startsWith("/signup") ? "/" : here;
  const onAuth = path.startsWith("/login") || path.startsWith("/signup");
  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="sticky top-0 z-10 border-b border-line/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto grid h-12 max-w-lg grid-cols-[auto_1fr_auto] items-center gap-2 px-3">
          <Link to="/" search={{ keep: "" }} aria-label="Home"><img src="/brand/logo.png" alt="The Common" className="h-8 w-auto max-w-16 object-contain" /></Link>
          <div className="min-w-0 text-center leading-none">
            <p className="font-display text-[15px] font-semibold tracking-[-0.03em] text-deep">Lambeth</p>
            <p className="mt-0.5 font-display text-[11px] font-semibold tracking-[0.04em] text-primary">Common Community</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Link to="/inbox" aria-label="Inbox" className="relative grid h-8 w-8 place-items-center rounded-full border border-line bg-white text-[#6d8176]">
              <Mail size={16} strokeWidth={1.75} />
              {unread + noteCount > 0 ? <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#1f7a45] px-1 text-[10px] font-medium text-white">{unread + noteCount}</span> : null}
            </Link>
            {onAuth ? <span className="w-8" /> : account ? (
              <Link to="/account" search={{ next }} aria-label="Account" className={`grid h-8 w-8 place-items-center rounded-full border border-line bg-white ${path.startsWith("/account") ? "text-primary" : "text-[#6d8176]"}`}>
                <UserRound size={16} strokeWidth={1.75} />
              </Link>
            ) : (
              <Link to="/login" search={{ next }} className="shrink-0 text-sm font-semibold text-primary">Log in</Link>
            )}
            {path === "/" ? null : <button type="button" aria-label="Back" className="grid h-7 w-7 place-items-center rounded-full border border-line bg-white text-sm" onClick={() => window.history.back()}>🔙</button>}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full min-w-0 max-w-lg overflow-x-hidden px-4 pb-40 pt-3">
        {children}
        <footer className="mt-6 border-t border-line pt-3 text-center text-xs text-muted">
          <p>THE COMMON COMMUNITY LTD. Company number 17493696. Registered office: 68 Bryn-Y-Nant, Cardiff CF23 9PA.</p>
          <p className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
            <Link to="/legal" search={{ page: "terms" }} className="font-medium text-primary">Terms</Link>
            <Link to="/legal" search={{ page: "privacy" }} className="font-medium text-primary">Privacy</Link>
            <Link to="/legal" search={{ page: "cookies" }} className="font-medium text-primary">Cookies</Link>
            <Link to="/legal" search={{ page: "company" }} className="font-medium text-primary">Company</Link>
          </p>
        </footer>
      </main>
      {cookieChoice ? null : (
        <div className="fixed inset-x-0 bottom-16 z-20 mx-auto w-full max-w-lg px-3">
          <div className="rounded-2xl border border-line bg-white p-3 text-sm shadow-lg">
            <p>Essential storage keeps you signed in. Measures stay on this phone and are optional.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" className="min-h-10 flex-1 rounded-full bg-primary text-sm font-medium text-white" onClick={() => setCookieChoice("measures")}>Allow measures</button>
              <button type="button" className="min-h-10 flex-1 rounded-full border border-line text-sm" onClick={() => setCookieChoice("essential")}>Essential only</button>
            </div>
          </div>
        </div>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line/80 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {tabs.map((tab) => {
            const active = tab.match(path);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.label}
                to={tab.to}
                search={"search" in tab ? tab.search : undefined}
                className={`flex flex-col items-center gap-1 px-1 pt-2 pb-1.5 text-[10px] leading-none font-medium tracking-[0.01em] ${active ? "text-primary" : "text-[#8aa094]"}`}
              >
                <Icon size={18} strokeWidth={active ? 2 : 1.6} />
                {tab.label}
                <span className={`h-0.5 w-4 rounded-full ${active ? "bg-gold" : "bg-transparent"}`} />
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function NeedsAccount({ next }: { next: string }) {
  return (
    <p className="text-sm text-muted">
      You can look around and use the contact details. <Link to="/login" search={{ next }} className="font-medium text-primary">Log in</Link> to send a message, book, report, or post.
    </p>
  );
}

export function ViewOnly() {
  return <p className="text-sm text-muted">Register for free to reply, book or buy a ticket. Looking around stays open. A business is charged after the three month trial, once the page is approved.</p>;
}

export function Card({ children }: { children: ReactNode }) {
  return <section className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-line bg-surface p-4 shadow-[0_8px_24px_-18px_rgba(16,40,32,0.45)]">{children}</section>;
}

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  const className = active
    ? "rounded-full bg-primary px-3 py-1 text-[11px] font-medium whitespace-nowrap text-white shadow-[0_6px_14px_-10px_rgba(0,56,32,0.9)]"
    : "rounded-full border border-[#d7e0da] bg-white px-3 py-1 text-[11px] whitespace-nowrap text-fg";
  return onClick ? (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  ) : (
    <span className={className}>{children}</span>
  );
}

export function BackButton({ children }: { children: ReactNode }) {
  return <div className="mb-2 flex justify-end">{children}</div>;
}

export const backButtonClass = "inline-flex h-7 shrink-0 items-center rounded-full border border-line bg-white px-2.5 text-[11px] font-medium text-deep";
