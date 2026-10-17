import { useState } from "react";

const AREAS = ["All Lambeth", "Clapham", "Brixton", "Streatham", "Vauxhall", "Herne Hill", "Stockwell", "Kennington"];

export function FilterBar({ onFilter }: { onFilter: (filters: { area: string; search: string }) => void }) {
  const [area, setArea] = useState("All Lambeth");
  const [search, setSearch] = useState("");

  function apply(a: string, s: string) {
    setArea(a);
    setSearch(s);
    onFilter({ area: a, search: s });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select value={area} onChange={(e) => apply(e.target.value, search)} className="h-9 rounded-lg border border-[#E8EDE9] px-2 text-sm">
        {AREAS.map((a) => <option key={a}>{a}</option>)}
      </select>
      <input type="search" value={search} onChange={(e) => apply(area, e.target.value)} placeholder="Search in view" className="h-9 flex-1 rounded-lg border border-[#E8EDE9] px-3 text-sm" />
    </div>
  );
}
