import { useState } from "react";
import { Link } from "@tanstack/react-router";

type Result = { type: string; id: string; title: string; href: string };

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);

  async function search(q: string) {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    // Mock results - replace with real search
    const mock: Result[] = [
      { type: "Business", id: "bus_1", title: "Be U Studio", href: "/business/be-u-studio" },
      { type: "Event", id: "evt_1", title: "Jazz Night", href: "/events/jazz-night" },
      { type: "User", id: "usr_1", title: "David Morris", href: "/desk/users?id=usr_1" },
    ].filter((r) => r.title.toLowerCase().includes(q.toLowerCase()));
    setResults(mock);
    setOpen(true);
  }

  return (
    <div className="relative">
      <input
        type="search"
        value={query}
        onChange={(e) => search(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder="Search people, businesses, events, cases or IDs"
        className="h-9 w-80 rounded-lg border border-[#E8EDE9] px-3 text-sm"
      />
      {open && results.length > 0 ? (
        <div className="absolute left-0 top-full z-30 mt-1 w-80 rounded-lg border border-[#E8EDE9] bg-white py-1 shadow-lg">
          {results.map((r) => (
            <Link key={r.id} to={r.href as "/"} className="flex items-center justify-between px-3 py-2 text-sm hover:bg-[#E8EDE9]" onClick={() => setOpen(false)}>
              <span>{r.title}</span>
              <span className="text-xs text-[#5C6F64]">{r.type}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
