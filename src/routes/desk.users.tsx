import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DeskFrame } from "@/components/desk/DeskFrame";

export const Route = createFileRoute("/desk/users")({ component: UsersDesk });

function UsersDesk() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: string; name: string; email: string }[]>([]);

  function search(q: string) {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    // Mock results
    setResults([
      { id: "usr_1", name: "David Morris", email: "david@thecommon.community" },
      { id: "usr_2", name: "Amira Khan", email: "amira@example.com" },
    ].filter((u) => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.includes(q.toLowerCase())));
  }

  return (
    <DeskFrame>
      <div className="grid gap-4">
        <h1 className="text-2xl font-bold text-[#102820]">People</h1>
        <input type="search" value={query} onChange={(e) => search(e.target.value)} placeholder="Search by name, email, or ID" className="h-10 rounded-lg border border-[#E8EDE9] px-3" />
        {results.length > 0 ? (
          <div className="rounded-xl border border-[#E8EDE9] bg-white">
            {results.map((u) => (
              <div key={u.id} className="flex items-center justify-between border-b border-[#E8EDE9] px-4 py-3 last:border-0">
                <div>
                  <p className="font-medium text-[#102820]">{u.name}</p>
                  <p className="text-xs text-[#5C6F64]">{u.email}</p>
                </div>
                <span className="text-xs text-[#5C6F64]">{u.id}</span>
              </div>
            ))}
          </div>
        ) : query.length >= 2 ? (
          <p className="text-sm text-[#5C6F64]">No results for "{query}"</p>
        ) : null}
      </div>
    </DeskFrame>
  );
}
