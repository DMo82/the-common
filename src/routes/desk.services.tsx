import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DeskDenied, DeskLocked, deskAllows, useDeskSeat } from "@/components/desk/DeskFrame";
import { COUNCIL_SERVICES } from "@/lib/common/services";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/desk/services")({ component: ServicesDesk });

function ServicesDesk() {
  const { seat, ready } = useDeskSeat();
  const account = useCommon((state) => state.account);
  const edits = useCommon((state) => state.serviceEdits ?? {});
  const hidden = useCommon((state) => state.hiddenServices ?? []);
  const saveService = useCommon((state) => state.saveService);
  const hideService = useCommon((state) => state.hideService);
  const [query, setQuery] = useState("");
  const council = account?.kind === "council" || account?.kind === "council_partner";
  if (!ready) return null;
  if (!seat && !council) return <DeskLocked />;
  if (seat && !deskAllows(seat, "admin") && !deskAllows(seat, "council") && !council) return <DeskDenied />;
  const rows = COUNCIL_SERVICES.filter((row) => !hidden.includes(row.id) && `${row.name} ${row.neighbourhood}`.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <div className="mx-auto grid max-w-3xl gap-3">
      <h1 className="font-serif text-3xl text-deep">Services</h1>
      <p className="text-sm text-muted">Admin, the super user and council can change or remove a service card. Bus, train and taxi links stay on the super user desk.</p>
      <input className="min-h-11 rounded-xl border border-line px-3" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a service" />
      {query.trim() ? rows.slice(0, 8).map((row) => {
        const edit = edits[row.id] ?? {};
        return (
          <article key={row.id} className="grid gap-2 rounded-3xl border border-line bg-white p-4">
            <p className="text-xs text-muted">{row.kind} · {row.neighbourhood}</p>
            <input className="min-h-11 rounded-xl border border-line px-3" defaultValue={edit.name || row.name} onBlur={(event) => saveService(row.id, { name: event.target.value })} />
            <input className="min-h-11 rounded-xl border border-line px-3" defaultValue={edit.address || row.address} onBlur={(event) => saveService(row.id, { address: event.target.value })} />
            <textarea rows={3} className="rounded-xl border border-line px-3 py-2" defaultValue={edit.detail || row.detail} onBlur={(event) => saveService(row.id, { detail: event.target.value })} />
            <button type="button" className="w-fit text-sm text-warn" onClick={() => hideService(row.id)}>Remove</button>
          </article>
        );
      }) : <p className="text-sm text-muted">Search a station, school or clinic. The list stays hidden until then.</p>}
    </div>
  );
}
