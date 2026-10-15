import { useState } from "react";
import { useCommon } from "@/lib/common/store";

export function AllocationPanel({ superUser }: { superUser: boolean }) {
  const allocations = useCommon((state) => state.allocations ?? []);
  const decideAllocation = useCommon((state) => state.decideAllocation);
  const [note, setNote] = useState("");
  const pending = allocations.filter((row) => row.status === "waiting");
  const done = allocations.filter((row) => row.status !== "waiting" && (!row.decidedAt || Date.now() - new Date(row.decidedAt).getTime() < 30 * 24 * 60 * 60 * 1000));

  return (
    <div className="grid gap-5">
      <details className="rounded-3xl border border-line bg-white p-4 shadow-[0_10px_24px_-20px_rgba(16,40,32,0.7)]"><summary className="cursor-pointer font-serif text-2xl text-deep">Pending approvals</summary><div className="mt-3 grid gap-3">
        {pending.length === 0 ? <p className="text-sm text-muted">Nothing waiting.</p> : pending.map((row) => (
          <div key={row.id} className="grid gap-1 rounded-xl bg-band px-3 py-2 text-sm">
            <p className="font-medium">{row.businessName}</p>
            <p className="text-muted">{row.kind || "business"} to {row.userName}</p>
            {superUser ? <div className="flex gap-3"><button type="button" className="font-medium text-primary" onClick={() => setNote(decideAllocation(row.id, true))}>Approve</button><button type="button" className="font-medium text-warn" onClick={() => setNote(decideAllocation(row.id, false))}>Refuse</button></div> : <p className="text-xs text-muted">Waiting for the super user.</p>}
          </div>
        ))}
      </div></details>
      <details className="rounded-3xl border border-line bg-white p-4 shadow-[0_10px_24px_-20px_rgba(16,40,32,0.7)]"><summary className="cursor-pointer font-serif text-2xl text-deep">Submitted approvals</summary><div className="mt-3 grid gap-3">
        {done.length === 0 ? <p className="text-sm text-muted">None in the last 30 days. Older decisions stay in the audit trail.</p> : done.slice(0, 8).map((row) => (
          <p key={row.id} className="text-sm">{row.businessName} · {row.userName} · {row.status}</p>
        ))}
      </div></details>
    </div>
  );
}
