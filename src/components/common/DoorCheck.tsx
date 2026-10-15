import { useState } from "react";
import { readTicket, type LocalEvent } from "@/lib/common/model";
import { useCommon } from "@/lib/common/store";

export function DoorCheck({ events, heading = "Door" }: { events: LocalEvent[]; heading?: string }) {
  const reservations = useCommon((state) => state.reservations);
  const scan = useCommon((state) => state.scan);
  const scanByName = useCommon((state) => state.scanByName);
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const chosen = events.find((row) => row.id === eventId) ?? events[0];
  const counted = reservations.filter((row) => row.eventId === chosen?.id && row.scannedAt).length;

  if (!chosen) {
    return <p className="text-sm text-muted">No published event to count yet.</p>;
  }

  return (
    <section className="grid gap-3 rounded-2xl border border-line bg-white p-4">
      <div>
        <p className="text-xs tracking-wide text-muted">
          <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">Door</span>
          Free tickets
        </p>
        <h2 className="mt-2 break-words font-serif text-2xl leading-tight text-deep">{heading}</h2>
        <p className="mt-1 text-sm text-muted">Count a free reservation once. No fees and no waivers.</p>
      </div>
      {events.length > 1 ? (
        <label className="grid gap-1 text-sm">
          Event
          <select value={chosen.id} onChange={(event) => setEventId(event.target.value)} className="min-h-11 rounded-xl border border-line bg-white px-3">
            {events.map((row) => (
              <option key={row.id} value={row.id}>{row.title}</option>
            ))}
          </select>
        </label>
      ) : (
        <p className="text-sm">{chosen.title}</p>
      )}
      <p className="text-3xl font-semibold">{counted} <span className="text-base font-normal text-muted">counted</span></p>
      <form
        className="grid gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!readTicket(code)) {
            setMessage("That code is not signed for this preview.");
            return;
          }
          const result = scan(code, chosen.id);
          setMessage(result.ok ? `Yes. ${result.name}.` : result.reason);
        }}
      >
        <label className="grid gap-1 text-sm">
          Code
          <input value={code} onChange={(event) => setCode(event.target.value)} className="min-h-11 rounded-xl border border-line px-3" />
        </label>
        <button type="submit" className="min-h-11 w-fit rounded-full bg-primary px-4 text-sm font-medium text-white">Count once</button>
      </form>
      <form
        className="grid gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const result = scanByName(name, chosen.id);
          setMessage(result.ok ? `Yes. ${result.name}.` : result.reason);
        }}
      >
        <label className="grid gap-1 text-sm">
          Name, if the code will not scan
          <input value={name} onChange={(event) => setName(event.target.value)} className="min-h-11 rounded-xl border border-line px-3" />
        </label>
        <button type="submit" className="min-h-11 w-fit rounded-full border border-line px-4 text-sm">Count by name</button>
      </form>
      {message ? <p className="text-sm">{message}</p> : null}
    </section>
  );
}
