import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCommon } from "@/lib/common/store";
import { useDeskSeat, deskAllows } from "@/components/desk/DeskFrame";

export const Route = createFileRoute("/desk/people")({ component: PeopleDesk });

const ROLES = ["Super Admin", "Admin", "Moderator", "Safeguarding Lead", "Business Owner", "Event Organiser", "Journalist", "Council"] as const;

function PeopleDesk() {
  const { seat } = useDeskSeat();
  const canAct = deskAllows(seat, "admin");
  const directory = useCommon((s) => s.directory ?? []);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [tab, setTab] = useState<"find" | "roles">("find");

  const matches = directory.filter((row) => {
    const text = `${row.name || ""} ${row.surname || ""} ${row.email || ""} ${row.username || ""}`.toLowerCase();
    if (query && !text.includes(query.toLowerCase())) return false;
    if (roleFilter && row.kind !== roleFilter.toLowerCase().replace(" ", "_")) return false;
    return true;
  }).slice(0, 20);

  return (
    <div className="mx-auto grid max-w-3xl gap-3">
      <h1 className="font-serif text-3xl text-deep">People</h1>
      <div className="flex gap-1">
        <button type="button" className={`rounded-full px-3 py-1 text-xs font-medium ${tab === "find" ? "bg-[#003820] text-white" : "border border-[#E8EDE9] bg-white"}`} onClick={() => setTab("find")}>Find a person</button>
        <button type="button" className={`rounded-full px-3 py-1 text-xs font-medium ${tab === "roles" ? "bg-[#003820] text-white" : "border border-[#E8EDE9] bg-white"}`} onClick={() => setTab("roles")}>Roles</button>
      </div>
      {tab === "find" ? (
        <>
          <div className="flex gap-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, email or username" className="min-h-10 flex-1 rounded-xl border border-line px-3 text-sm" />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="min-h-10 rounded-xl border border-line px-2 text-sm">
              <option value="">All roles</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="grid gap-2">
            {matches.map((row) => (
              <article key={row.email} className="rounded-xl border border-line p-3">
                <p className="font-medium">{row.name} {row.surname}</p>
                <p className="text-xs text-muted">{row.email} · {row.kind || "member"}</p>
              </article>
            ))}
            {matches.length === 0 ? <p className="text-sm text-muted">No matches.</p> : null}
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-xs font-semibold uppercase text-[#5C6F64]">Roles matrix (read-only)</p>
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th>Role</th>
                <th>Approve</th>
                <th>Allocate</th>
                <th>Safeguard</th>
              </tr>
            </thead>
            <tbody>
              {ROLES.map((role) => (
                <tr key={role} className="border-t border-[#E8EDE9]">
                  <td className="py-1">{role}</td>
                  <td>{role === "Super Admin" || role === "Admin" ? "Yes" : "—"}</td>
                  <td>{role === "Super Admin" ? "Yes" : "—"}</td>
                  <td>{role === "Super Admin" || role === "Safeguarding Lead" ? "Yes" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!canAct ? <p className="mt-2 text-xs text-muted">View only.</p> : null}
        </div>
      )}
    </div>
  );
}
