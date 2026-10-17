import { createFileRoute } from "@tanstack/react-router";
import { DeskFrame } from "@/components/desk/DeskFrame";
import { useState } from "react";

export const Route = createFileRoute("/desk/owner")({ component: OwnerDesk });

function OwnerDesk() {
  const [section, setSection] = useState("overview");
  return (
    <DeskFrame>
      <div className="grid gap-4">
        <h1 className="text-2xl font-bold text-[#102820]">Business desk</h1>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <p className="text-xs text-[#5C6F64]">Views</p>
            <p className="text-lg font-bold">1,240</p>
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-3">
            <p className="text-xs text-[#5C6F64]">Bookings</p>
            <p className="text-lg font-bold">42</p>
          </div>
        </div>
        <select className="rounded-lg border border-[#E8EDE9] px-3 py-2 text-sm">
          <option>Be U Studio</option>
          <option>Brew & Barrel</option>
          <option>Buddy's Deli</option>
        </select>
        <div className="flex gap-2">
          {["overview", "menu", "events", "team"].map((s) => (
            <button key={s} type="button" onClick={() => setSection(s)} className={`rounded-full px-3 py-1 text-xs font-medium ${section === s ? "bg-[#003820] text-white" : "border border-[#E8EDE9]"}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        {section === "overview" ? (
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
            <h2 className="font-medium text-[#102820]">Overview</h2>
            <p className="mt-2 text-sm text-[#5C6F64]">Your business at a glance.</p>
          </div>
        ) : null}
        {section === "menu" ? (
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
            <h2 className="font-medium text-[#102820]">Menu</h2>
            <p className="mt-2 text-sm text-[#5C6F64]">Add and edit menu items.</p>
          </div>
        ) : null}
        {section === "events" ? (
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
            <h2 className="font-medium text-[#102820]">Events</h2>
            <p className="mt-2 text-sm text-[#5C6F64]">Create and manage events.</p>
          </div>
        ) : null}
        {section === "team" ? (
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
            <h2 className="font-medium text-[#102820]">Team</h2>
            <p className="mt-2 text-sm text-[#5C6F64]">Add staff by QR or code.</p>
          </div>
        ) : null}
      </div>
    </DeskFrame>
  );
}
