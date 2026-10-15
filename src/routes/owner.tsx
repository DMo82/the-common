import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/owner")({ component: OwnerDesk });

const TABS = ["Overview", "Messages", "Bookings", "Profile", "Promotions"] as const;

function OwnerDesk() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const businesses = useCommon((s) => s.businesses);
  const events = useCommon((s) => s.events);
  const enquiries = useCommon((s) => s.enquiries);
  const updateBusiness = useCommon((s) => s.updateBusiness);
  const [claimCode, setClaimCode] = useState("");
  const [claimNote, setClaimNote] = useState("");
  const [redemptions, setRedemptions] = useState(0);
  const [bookingTab, setBookingTab] = useState<"requested" | "confirmed" | "declined">("requested");
  const [editing, setEditing] = useState("");
  const [form, setForm] = useState({ name: "", about: "", address: "", postcode: "", phone: "", email: "", hours: "" });
  const [saved, setSaved] = useState("");

  const mine = businesses.filter((b) => b.status === "published");
  const views = mine.reduce((sum, b) => sum + (b.views || 0), 0);
  const valueNote = views > 0 ? `Your pages were viewed ${views} times this month.` : "No views yet this month.";
  const clicks = mine.reduce((sum, b) => sum + (b.clicks || 0), 0);
  const unread = enquiries.filter((e) => !e.read).length;
  const myEvents = events.filter((e) => e.status === "published").slice(0, 3);

  function claim() {
    if (claimCode.trim().length < 4) {
      setClaimNote("Enter a valid claim code.");
      return;
    }
    setClaimNote("Claim submitted. An admin will review it.");
    setClaimCode("");
  }

  function startEdit(id: string) {
    const b = businesses.find((row) => row.id === id);
    if (!b) return;
    setForm({ name: b.name, about: b.about || "", address: b.address, postcode: b.postcode, phone: b.phone || "", email: b.email || "", hours: b.hours || "" });
    setEditing(id);
    setSaved("");
  }

  function save() {
    if (!editing) return;
    updateBusiness(editing, form);
    setSaved("Saved.");
    setEditing("");
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-3">
      <h1 className="font-serif text-3xl text-deep">Business owner</h1>
      <div className="flex gap-1">
        {TABS.map((t) => (
          <button key={t} type="button" className={`rounded-full px-3 py-1 text-xs font-medium ${tab === t ? "bg-[#003820] text-white" : "border border-[#E8EDE9] bg-white"}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab === "Overview" ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-[#E8EDE9] bg-white p-3 text-center">
              <p className="text-2xl font-semibold text-[#003820]">{views}</p>
              <p className="text-xs text-muted">Views</p>
            </div>
            <div className="rounded-xl border border-[#E8EDE9] bg-white p-3 text-center">
              <p className="text-2xl font-semibold text-[#003820]">{clicks}</p>
              <p className="text-xs text-muted">Clicks</p>
            </div>
            <div className="rounded-xl border border-[#E8EDE9] bg-white p-3 text-center">
              <p className="text-2xl font-semibold text-[#003820]">{unread}</p>
              <p className="text-xs text-muted">Unread</p>
            </div>
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
            <h2 className="font-serif text-xl text-deep">Your businesses</h2>
            {mine.slice(0, 5).map((b) => (
              <div key={b.id} className="mt-2 flex items-center justify-between border-t border-[#E8EDE9] pt-2">
                <p className="text-sm font-medium">{b.name}</p>
                <span className="text-xs text-muted">{b.views || 0} views</span>
              </div>
            ))}
            {mine.length === 0 ? <p className="mt-2 text-sm text-muted">No published businesses yet.</p> : null}
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
            <h2 className="font-serif text-xl text-deep">Claim a business</h2>
            <p className="mt-1 text-sm text-muted">Enter the unique code given by the super user.</p>
            <input value={claimCode} onChange={(e) => setClaimCode(e.target.value)} placeholder="Claim code" className="mt-3 min-h-11 w-full rounded-xl border border-line px-3" />
            <button type="button" className="mt-2 rounded-full bg-[#003820] px-4 py-2 text-sm font-medium text-white" onClick={claim}>Submit claim</button>
            {claimNote ? <p className="mt-2 text-sm text-[#003820]">{claimNote}</p> : null}
          </div>
        </>
      ) : tab === "Messages" ? (
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-serif text-xl text-deep">Messages</h2>
          {enquiries.slice(0, 5).map((e) => (
            <div key={e.id} className="mt-2 border-t border-[#E8EDE9] pt-2">
              <p className="text-sm font-medium">{e.from || "Someone"}</p>
              <p className="text-xs text-muted">{e.body?.slice(0, 80) || "No message"}</p>
            </div>
          ))}
          {enquiries.length === 0 ? <p className="mt-2 text-sm text-muted">No messages yet.</p> : null}
        </div>
      ) : tab === "Bookings" ? (
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <div className="flex gap-1">
            {(["requested", "confirmed", "declined"] as const).map((t) => (
              <button key={t} type="button" className={`rounded-full px-3 py-1 text-xs font-medium ${bookingTab === t ? "bg-[#003820] text-white" : "border border-[#E8EDE9] bg-white"}`} onClick={() => setBookingTab(t)}>{t}</button>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">No {bookingTab} bookings yet.</p>
        </div>
      ) : tab === "Profile" ? (
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-serif text-xl text-deep">Profile</h2>
          {mine.length === 0 ? <p className="mt-2 text-sm text-muted">Claim a business to edit its profile.</p> : null}
          {mine.map((b) => (
            <div key={b.id} className="mt-3 border-t border-[#E8EDE9] pt-3">
              {editing === b.id ? (
                <div className="grid gap-2">
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="min-h-10 rounded-xl border border-line px-3 text-sm" />
                  <textarea value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} placeholder="About" className="min-h-20 rounded-xl border border-line px-3 py-2 text-sm" />
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" className="min-h-10 rounded-xl border border-line px-3 text-sm" />
                  <input value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })} placeholder="Postcode" className="min-h-10 rounded-xl border border-line px-3 text-sm" />
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="min-h-10 rounded-xl border border-line px-3 text-sm" />
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="min-h-10 rounded-xl border border-line px-3 text-sm" />
                  <input value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} placeholder="Hours" className="min-h-10 rounded-xl border border-line px-3 text-sm" />
                  <div className="flex gap-2">
                    <button type="button" className="rounded-full bg-[#003820] px-4 py-2 text-sm font-medium text-white" onClick={save}>Save</button>
                    <button type="button" className="rounded-full border border-line px-4 py-2 text-sm" onClick={() => setEditing("")}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium">{b.name}</p>
                  <p className="text-xs text-muted">{b.address} · {b.postcode}</p>
                  <p className="mt-1 text-xs text-muted">{b.phone} · {b.email}</p>
                  <button type="button" className="mt-2 rounded-full border border-[#003820] px-3 py-1 text-xs font-medium text-[#003820]" onClick={() => startEdit(b.id)}>Edit</button>
                </div>
              )}
            </div>
          ))}
          {saved ? <p className="mt-2 text-sm text-[#003820]">{saved}</p> : null}
        </div>
      ) : (
        <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
          <h2 className="font-serif text-xl text-deep">Promotions</h2>
          <p className="mt-2 text-sm text-muted">Create a promotion once your business is published.</p>
          {myEvents.length > 0 ? (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase text-[#5C6F64]">Your events</p>
              {myEvents.map((e) => (
                <p key={e.id} className="mt-1 text-sm">{e.title}</p>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
