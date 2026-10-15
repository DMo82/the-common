import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DeskDenied, DeskLocked, deskAllows, useDeskSeat } from "@/components/desk/DeskFrame";

export const Route = createFileRoute("/desk/messages")({ component: MessagesDesk });

function MessagesDesk() {
  const { seat, ready } = useDeskSeat();
  const [logs, setLogs] = useState<{ id: string; action: string; entity_id: string; actor: string; created_at: string }[]>([]);
  useEffect(() => {
    fetch("/api/audit?entity=message").then((r) => r.json()).then(setLogs).catch(() => {});
  }, []);
  if (!ready) return <p className="p-6 text-sm text-muted">Loading.</p>;
  if (!seat) return <DeskLocked />;
  if (!deskAllows(seat, "admin")) return <DeskDenied />;

  return (
    <div className="mx-auto grid max-w-3xl gap-3">
      <h1 className="font-serif text-3xl text-deep">Messages</h1>
      <p className="text-sm text-muted">Message access log. Staff can view conversations with a reason.</p>
      {logs.map((log) => (
        <div key={log.id} className="rounded-xl border border-line bg-white p-3 text-sm">
          <p className="font-medium">{log.action}</p>
          <p className="text-muted">{log.entity_id} · {log.actor} · {new Date(log.created_at).toLocaleString()}</p>
        </div>
      ))}
      {logs.length === 0 ? <p className="text-sm text-muted">No message access logged.</p> : null}
    </div>
  );
}
