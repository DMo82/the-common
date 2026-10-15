import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/organiser")({ component: OrganiserDesk });

const TABS = ["Overview", "Events", "Messages", "Profile"] as const;

function OrganiserDesk() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const events = useCommon((s) => s.events);
  const enquiries = useCommon((s) => s.enquiries);
  const mine = events.filter((e) => e.status === "published" || e.status === "pending");
  const views = mine.reduce((sum, e) => sum + (e.views || 0), 0);
  const unread = enquiries.filter((e) => !e.read).length;

  return (
    <div className="mx-auto grid max-w-3xl gap-3">
      <h1 className="font-serif text-3xl text-deep">Event organiser</h1>
      <div className="flex gap-1">
        {TABS.map((t) => (
          <button key={t} type="button" className={`rounded-full px-3 py-1 text-xs font-medium ${tab === t ? "bg-[#003820] text-white" : "border border-[#E8EDE9] bg-white"}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab === "Overview" ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-[#E8EDE9] bg-white p-3 text-center">
              <p className="text-2xl font-semibold text-[#003820]">{mine.length}</p>
              <p className="text-xs text-muted">Events</p>
            </div>
            <div className="rounded-xl border border-[#E8EDE9] bg-white p-3 text-center">
              <p className="text-2xl font-semibold text-[#003820]">{views}</p>
              <p className="text-xs text-muted">Views</p>
            </div>
            <div className="rounded-xl border border-[#E8EDE9] bg-white p-3 text-center">
              <p className="text-2xl font-semibold text-[#003820]">{unread}</p>
              <p className="text-xs text-muted">Unread</p>
            </div>
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
            <h2 className="font-serif text-xl text-deep">Your events</h2>
            {mine.slice(0, 5).map((e) => (
              <div key={e.id} className="mt-2 flex items-center justify-between border-t border-[#E8EDE9] pt-2">
                <p className="text-sm font-medium">{e.title}</p>
                <span className="text-xs text-muted">{e.status}</span>
              </div>
            ))}
            {mine.length === 0 ? <p className="mt-2 text-sm text-muted">No events yet.</p> : null}
          </div>
        </>
      ) : tab === "Events" ? (
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-serif text-xl text-deep">Events</h2>
          {mine.map((e) => (
            <div key={e.id} className="mt-2 border-t border-[#E8EDE9] pt-2">
              <p className="text-sm font-medium">{e.title}</p>
              <p className="text-xs text-muted">{e.when || "Date not set"} · {e.status}</p>
            </div>
          ))}
          {mine.length === 0 ? <p className="mt-2 text-sm text-muted">No events yet.</p> : null}
        </div>
      ) : tab === "Messages" ? (
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-serif text-xl text-deep">Messages</h2>
          {enquiries.slice(0, 5).map((e) => (
            <div key={e.id} className="mt-2 border-t border-[#E8EDE9] pt-2">
              <p className="text-sm font-medium">{e.from || "Someone"}</p>
              <p className="text-xs text-muted">{e.body?.slice(0, 80) || "No message"}</p>
            </div>
          ))}
          {enquiries.length === 0 ? <p className="mt-2 text-sm text-muted">No messages.</p> : null}
        </div>
      ) : (
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-serif text-xl text-deep">Profile</h2>
          <p className="mt-2 text-sm text-muted">Event organiser profile.</p>
        </div>
      )}
    </div>
  );
}
