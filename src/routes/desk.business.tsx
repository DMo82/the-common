import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DoorCheck } from "@/components/common/DoorCheck";
import { DeskDenied, DeskLocked, deskAllows, useDeskSeat } from "@/components/desk/DeskFrame";
import { areaFor } from "@/lib/common/model";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/desk/business")({ component: BusinessDesk });

function BusinessDesk() {
  const { seat, ready } = useDeskSeat();
  const businesses = useCommon((state) => state.businesses);
  const decide = useCommon((state) => state.decide);
  const [statusFilter, setStatusFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [openVerify, setOpenVerify] = useState("");
  const [reason, setReason] = useState("");
  const filtered = businesses.filter((row) => (!statusFilter || row.status === statusFilter) && (!areaFilter || areaFor(row.postcode)?.discoveryName === areaFilter));
  const areas = [...new Set(businesses.map((row) => areaFor(row.postcode)?.discoveryName).filter(Boolean))] as string[];
  const statuses = [...new Set(businesses.map((row) => row.status))];
  const pending = businesses.filter((row) => row.status === "pending" || row.status === "changes_requested");

  if (!ready) return null;
  if (!seat) return <DeskLocked />;
  if (!deskAllows(seat, "business")) return <DeskDenied />;

  function act(id: string, status: "published" | "refused") {
    decide("business", id, status, reason || (status === "published" ? "Verified" : "Not verified"), seat?.email || "Admin");
    setOpenVerify("");
    setReason("");
  }

  return (
    <div>
      <p className="text-xs tracking-wide text-muted">
        <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">Shops</span>
        Every published page
      </p>
      <h1 className="mt-2 break-words font-serif text-3xl leading-tight text-deep">Business</h1>
      <p className="mt-2 max-w-3xl text-sm text-muted">
        Super admin view of every page. A shop owner still registers and submits from their own account, and an admin still has to approve an event or a listing before it is public. You are not signed in as a shop.
      </p>
      <details className="mt-4 rounded-xl border border-line bg-white p-4">
        <summary className="cursor-pointer font-serif text-xl text-deep">Verification · {pending.length}</summary>
        <div className="mt-3 grid gap-2">
          {pending.map((row) => {
            const submitted = new Date().toISOString().slice(0, 10);
            return (
              <article key={row.id} className="rounded-xl border border-[#E8EDE9] p-3">
                <button type="button" className="block w-full text-left" onClick={() => setOpenVerify(openVerify === row.id ? "" : row.id)}>
                  <p className="font-medium">{row.name}</p>
                  <p className="text-xs text-muted">Submitted {submitted} · {row.status.replaceAll("_", " ")}</p>
                </button>
                {openVerify === row.id ? (
                  <div className="mt-3 grid gap-3 border-t border-[#E8EDE9] pt-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase text-[#5C6F64]">Owner</p>
                      <p className="mt-1 text-sm">{row.ownerName || "Not named"}</p>
                      <p className="text-xs text-muted">{row.ownerEmail || "No email"}</p>
                      <p className="mt-1 text-xs text-muted">{row.phone || "No phone"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-[#5C6F64]">Evidence</p>
                      <p className="mt-1 text-sm">{row.proof || "No evidence attached."}</p>
                      <p className="mt-1 text-xs text-muted">{row.address} · {row.postcode}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for decision" className="min-h-10 w-full rounded-xl border border-line px-3 text-sm" />
                      <div className="mt-2 flex gap-2">
                        <button type="button" className="rounded-full bg-[#003820] px-3 py-1 text-xs font-medium text-white" onClick={() => act(row.id, "published")}>Approve</button>
                        <button type="button" className="rounded-full border border-[#8A1C1C] px-3 py-1 text-xs font-medium text-[#8A1C1C]" onClick={() => act(row.id, "refused")}>Reject</button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
          {pending.length === 0 ? <p className="text-sm text-muted">No businesses waiting for verification.</p> : null}
        </div>
      </details>
      <div className="mt-5 flex gap-2">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-lg border border-line px-2 text-sm">
          <option value="">All statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
        </select>
        <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} className="h-9 rounded-lg border border-line px-2 text-sm">
          <option value="">All areas</option>
          {areas.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs tracking-wide text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Business</th>
              <th className="px-3 py-2 font-medium">Area</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 20).map((row) => (
              <tr key={row.id} className="border-b border-line last:border-0">
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2">{areaFor(row.postcode)?.discoveryName || "—"}</td>
                <td className="px-3 py-2">{row.status.replaceAll("_", " ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
