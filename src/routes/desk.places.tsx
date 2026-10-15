import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/desk/places")({ component: PlacesDesk });

const TABS = ["Businesses", "Events", "Services", "Areas"] as const;

function PlacesDesk() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Businesses");
  const businesses = useCommon((s) => s.businesses);
  const events = useCommon((s) => s.events);
  const services = useCommon((s) => s.services ?? []);
  const areas = useCommon((s) => s.areas ?? []);

  const published = businesses.filter((b) => b.status === "published");
  const publishedEvents = events.filter((e) => e.status === "published");

  return (
    <div className="mx-auto grid max-w-3xl gap-3">
      <h1 className="font-serif text-3xl text-deep">Places</h1>
      <div className="flex gap-1">
        {TABS.map((t) => (
          <button key={t} type="button" className={`rounded-full px-3 py-1 text-xs font-medium ${tab === t ? "bg-[#003820] text-white" : "border border-[#E8EDE9] bg-white"}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab === "Businesses" ? (
        <div className="grid gap-2">
          {published.slice(0, 20).map((b) => (
            <article key={b.id} className="rounded-xl border border-[#E8EDE9] bg-white p-3">
              <p className="text-sm font-medium">{b.name}</p>
              <p className="text-xs text-muted">{b.area || b.postcode} · {b.category || "Business"}</p>
            </article>
          ))}
          {published.length === 0 ? <p className="text-sm text-muted">No published businesses.</p> : null}
        </div>
      ) : tab === "Events" ? (
        <div className="grid gap-2">
          {publishedEvents.slice(0, 20).map((e) => (
            <article key={e.id} className="rounded-xl border border-[#E8EDE9] bg-white p-3">
              <p className="text-sm font-medium">{e.title}</p>
              <p className="text-xs text-muted">{e.when || "Date not set"} · Free</p>
            </article>
          ))}
          {publishedEvents.length === 0 ? <p className="text-sm text-muted">No published events.</p> : null}
        </div>
      ) : tab === "Services" ? (
        <div className="grid gap-2">
          {services.slice(0, 20).map((s) => (
            <article key={s.id} className="rounded-xl border border-[#E8EDE9] bg-white p-3">
              <p className="text-sm font-medium">{s.name}</p>
              <p className="text-xs text-muted">{s.type || "Service"}</p>
            </article>
          ))}
          {services.length === 0 ? <p className="text-sm text-muted">No services listed.</p> : null}
        </div>
      ) : (
        <div className="grid gap-2">
          {areas.slice(0, 16).map((a) => (
            <article key={a.id} className="rounded-xl border border-[#E8EDE9] bg-white p-3">
              <p className="text-sm font-medium">{a.name}</p>
              <p className="text-xs text-muted">{a.count || 0} businesses</p>
            </article>
          ))}
          {areas.length === 0 ? <p className="text-sm text-muted">No areas configured.</p> : null}
        </div>
      )}
    </div>
  );
}
