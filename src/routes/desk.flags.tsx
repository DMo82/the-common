import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DeskDenied, DeskLocked, deskAllows, useDeskSeat } from "@/components/desk/DeskFrame";

export const Route = createFileRoute("/desk/flags")({ component: FlagsDesk });

function FlagsDesk() {
  const { seat, ready } = useDeskSeat();
  const [flags, setFlags] = useState<{ key: string; enabled: boolean; description: string }[]>([]);
  useEffect(() => {
    fetch("/api/flags").then((r) => r.json()).then(setFlags).catch(() => {});
  }, []);
  if (!ready) return <p className="p-6 text-sm text-muted">Loading.</p>;
  if (!seat) return <DeskLocked />;
  if (!deskAllows(seat, "admin")) return <DeskDenied />;

  async function toggle(key: string, enabled: boolean) {
    await fetch("/api/flags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, enabled }) });
    setFlags((rows) => rows.map((r) => r.key === key ? { ...r, enabled } : r));
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-3">
      <h1 className="font-serif text-3xl text-deep">Feature flags</h1>
      {flags.map((flag) => (
        <div key={flag.key} className="flex items-center justify-between rounded-xl border border-line bg-white p-3">
          <div>
            <p className="font-medium">{flag.key}</p>
            <p className="text-sm text-muted">{flag.description}</p>
          </div>
          <button type="button" onClick={() => toggle(flag.key, !flag.enabled)} className={`min-h-10 rounded-xl px-3 text-sm ${flag.enabled ? "bg-primary text-white" : "border border-line"}`}>
            {flag.enabled ? "On" : "Off"}
          </button>
        </div>
      ))}
      {flags.length === 0 ? <p className="text-sm text-muted">No flags configured.</p> : null}
    </div>
  );
}
