import { ChatThread } from "@/components/common/ChatThread";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MapView } from "@/components/common/MapView";
import { Keep } from "@/components/common/Keep";
import { BackButton, Card, NeedsAccount, Shell, ViewOnly, backButtonClass } from "@/components/common/Shell";
import { ModeratorEdit } from "@/components/desk/ModeratorEdit";
import { locationMessage, readPosition, watchGeoPermission } from "@/lib/common/location";
import { pictureFor } from "@/lib/common/pictures";
import { ReportModal } from "@/components/common/ReportModal";
import { useCommon, placesTaken } from "@/lib/common/store";

const CONTACTS: Record<string, { phone?: string; email?: string }> = {
  "pegasus-clapham": { phone: "020 7926 0717", email: "ClaphamLibrary@lambeth.gov.uk" },
  "evt_5797154f-af8e-7a3b-9981-3989c7d1e3b5": { phone: "020 7926 0717", email: "ClaphamLibrary@lambeth.gov.uk" },
  "evt_cf621753-e71d-3635-84cc-2f12bc0c1a08": { phone: "020 7926 1056", email: "BrixtonLendingLibrary@lambeth.gov.uk" },
  "evt_3ad7e957-0e77-5f98-ec98-af252809e9de": { phone: "020 7926 6076", email: "archives@lambeth.gov.uk" },
  "evt_ccf4cbbe-91be-5cd0-9a00-a60bba874c22": { email: "brixchamber@gmail.com" },
};

export const Route = createFileRoute("/event/$id")({
  validateSearch: (search: Record<string, unknown>) => ({
    from: search.from === "saved" || search.from === "favourite" || search.from === "desk" ? search.from : "",
  }),
  component: EventPage,
});

function EventPage() {
  const { id } = Route.useParams();
  const { from } = Route.useSearch();
  const event = useCommon((state) => state.events.find((row) => row.id === id));
  const business = useCommon((state) => state.businesses.find((row) => row.id === event?.businessId));
  const account = useCommon((state) => state.account);
  const reservations = useCommon((state) => state.reservations);
  const reserve = useCommon((state) => state.reserve);
  const report = useCommon((state) => state.report);
  const block = useCommon((state) => state.block);
  const blocked = useCommon((state) => state.blocked ?? []);
  const [message, setMessage] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportRef, setReportRef] = useState("");
  const [start, setStart] = useState("");
  const [origin, setOrigin] = useState("");
  const [locateNote, setLocateNote] = useState("");
  const userSet = useRef(false);

  useEffect(() => {
    return watchGeoPermission((state) => {
      if (state !== "granted" || userSet.current) return;
      void readPosition()
        .then((position) => {
          if (userSet.current) return;
          setOrigin(`${position.coords.latitude},${position.coords.longitude}`);
          setLocateNote("Using your location.");
        })
        .catch(() => undefined);
    });
  }, []);

  if (!event || (event.status !== "published" && from !== "desk")) {
    return (
      <Shell>
        <Card>
          <h1 className="text-xl font-semibold">This event is not public</h1>
        </Card>
      </Shell>
    );
  }

  const taken = placesTaken(reservations, event.id);
  const full = event.capacity > 0 && taken >= event.capacity;
  const mine = reservations.find((row) => row.eventId === event.id && row.accountName === account?.name);
  const places = event.capacity > 0 ? event.capacity : 40;
  const holdable = !event.tickets;
  const enquire = useCommon((state) => state.enquire);
  const eventNotes = useCommon((state) => state.enquiries).filter((row) => row.eventId === event.id && row.from !== "Admin");
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const listed = CONTACTS[event.id] ?? {};
  const phone = event.phone || listed.phone || (business && !business.phone.startsWith("Not") ? business.phone : "");
  const email = event.email || listed.email || (business?.email.includes("@") ? business.email : "");
  const postcode = event.postcode || (event.address || "").match(/\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i)?.[0] || business?.postcode || "";
  const place = {
    name: event.place || business?.name || event.title,
    address: event.address || business?.address || event.neighbourhood,
    postcode: postcode || "London",
  };
  const destination = [place.name, place.address, place.postcode, "London"].filter((part, index, arr) => part && arr.indexOf(part) === index).join(", ");
  const routeHref = origin
    ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;

  function showRoute(from: string, note = "") {
    const next = from.trim();
    if (!next) return;
    userSet.current = true;
    setOrigin(next);
    setLocateNote(note);
  }

  const [payNote, setPayNote] = useState("");

  function useMyLocation() {
    setLocateNote("Finding where you are…");
    void readPosition()
      .then((position) => {
        setStart("");
        showRoute(`${position.coords.latitude},${position.coords.longitude}`, "Using your location.");
      })
      .catch((error: unknown) => {
        setLocateNote(locationMessage(error, "This browser has no location. Type a starting point instead."));
      });
  }

  return (
    <Shell>
      <div className="grid gap-4">
        {from === "desk" ? <ModeratorEdit kind="event" id={event.id} fields={[{ key: "title", label: "Title", value: event.title }, { key: "detail", label: "Description", value: event.detail }, { key: "when", label: "When", value: event.when }, { key: "place", label: "Place", value: event.place }, { key: "address", label: "Address", value: event.address }]} media={{ image: event.image }} /> : null}
        <div>
          <p className="text-xs tracking-wide text-muted">
            <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">{event.neighbourhood || "EVENT"}</span>
            {business?.name ?? event.place}
          </p>
          <p className="mt-2 text-xs font-semibold tracking-[0.14em] text-primary">{event.kind || "Community"}</p>
          <div className="mt-3 flex items-start justify-between gap-2"><h1 className="min-w-0 break-words font-serif text-3xl leading-tight font-medium">{event.title}</h1></div>
          <div className="relative mt-4 overflow-hidden rounded-2xl shadow-[0_16px_32px_-20px_rgba(16,40,32,0.85)]">
            {<img src={event.image || pictureFor(`${event.title} ${event.kind} ${event.detail || ""}`, "event")} alt="" className="block h-56 w-full object-cover" onError={(node) => { if (node.currentTarget.dataset.fell) return; node.currentTarget.dataset.fell = "1"; node.currentTarget.src = pictureFor(`${event.title} ${event.kind} ${event.detail || ""}`, "event"); }} />}
            <Keep overlay id={event.id} next={`/event/${event.id}?from=${from}`} title={event.title} />
          </div>
          <p className="mt-4 text-sm text-muted">Date</p>
          <p className="font-medium">{event.date || event.when}</p>
          {event.time ? (
            <>
              <p className="mt-3 text-sm text-muted">Time</p>
              <p className="font-medium">{event.time}</p>
            </>
          ) : null}
          <p className="mt-3 text-sm text-muted">Location</p>
          <p className="font-medium">{event.place || business?.name}</p>
          <p className="text-sm text-muted">{event.address || (business ? `${business.address}, ${business.postcode}` : "")}</p>
          <p className="mt-4 leading-relaxed">{event.detail}</p>
          {event.sample ? <p className="mt-2 text-sm text-muted">Sample listing for this preview. It is not a published event.</p> : null}
        </div>
        <div className="grid gap-2">
          {eventNotes.length ? <ChatThread notes={eventNotes} /> : null}{account ? <form className="grid gap-2" onSubmit={(submit) => { submit.preventDefault(); if (!text.trim()) return; enquire(event.businessId, text, event.id); setText(""); setSent(true); }}><textarea value={text} onChange={(input) => setText(input.target.value)} placeholder="Message the host" rows={3} className="w-full rounded-xl border border-line px-3 py-2" /><button className="min-h-11 w-fit rounded-full bg-primary px-4 text-sm text-white">Send</button>{sent ? <p className="text-sm text-muted">Sent to the host. They reply in their inbox.</p> : null}<p className="text-xs text-muted">Your name and message go to the host. We keep enquiries for 12 months. See our <a href="/legal?page=privacy" className="text-primary">Privacy Notice</a>.</p></form> : <p className="text-sm text-muted">Log in to message the host.</p>}
          {event.website ? (
            <a href={event.website} target="_blank" rel="noreferrer" className="min-h-11 rounded-xl bg-primary px-3 py-3 text-center text-sm font-medium text-white">
              Website
            </a>
          ) : null}
          {event.tickets ? (
            <button type="button" className="min-h-11 rounded-xl border border-primary bg-white px-3 py-3 text-center text-sm font-medium text-primary" onClick={() => { const held = reserve(event.id); setPayNote(held.ok ? `You're registered. Show your QR at the door. Code: ${held.code}` : held.reason); }}>
              Reserve a free place
            </button>
          ) : (
            <p className="text-sm text-muted">No ticket sales for this listing.</p>
          )}
          {payNote ? <p className="text-sm text-muted">{payNote}</p> : null}
          {event.tickets ? <p className="text-xs text-muted">Your name and email go to the organiser for check-in. We keep registrations for 90 days after the event. See our <a href="/legal?page=privacy" className="text-primary">Privacy Notice</a>.</p> : null}
        </div>
        <details className="rounded-2xl border border-line bg-white px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium">Map and directions</summary>
          <div className="mt-3 grid gap-3">
            <MapView place={place} origin={origin || undefined} />
            <form
              className="grid gap-2"
              onSubmit={(formEvent) => {
                formEvent.preventDefault();
                showRoute(start);
              }}
            >
              <label className="grid gap-1 text-sm">
                Starting point
                <input
                  value={start}
                  onChange={(formEvent) => setStart(formEvent.target.value)}
                  placeholder="A street, station or postcode"
                  className="min-h-11 rounded-xl border border-line bg-white px-3"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button type="submit" className="min-h-11 rounded-xl bg-primary px-3 text-sm font-medium text-white">
                  Directions
                </button>
                <button type="button" className="min-h-11 rounded-xl border border-primary bg-white px-3 text-sm font-medium text-primary" onClick={useMyLocation}>
                  Use my location
                </button>
              </div>
            </form>
            {locateNote ? <p className="text-sm text-muted">{locateNote}</p> : null}
            {origin ? <p className="text-sm">The map shows the way from your starting point.</p> : null}
            <a className="text-sm font-medium text-primary" href={routeHref} target="_blank" rel="noreferrer">
              Open the route in Google Maps
            </a>
          </div>
        </details>
        <details className="rounded-2xl border border-line bg-white px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium">Contact details</summary>
          <div className="mt-3 grid gap-2">
            {phone ? (
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="min-h-11 rounded-xl bg-primary px-3 py-3 text-center text-sm font-medium text-white">
                Call {phone}
              </a>
            ) : (
              <p className="text-sm text-muted">No phone number was published.</p>
            )}
            {email ? (
              <a href={`mailto:${email}`} className="min-h-11 rounded-xl border border-primary bg-white px-3 py-3 text-center text-sm font-medium text-primary">
                Email {email}
              </a>
            ) : (
              <p className="text-sm text-muted">No email address was published.</p>
            )}
            {account ? <form className="grid gap-2" onSubmit={(submit) => { submit.preventDefault(); if (!text.trim()) return; enquire(event.businessId, text, event.id); setText(""); setSent(true); }}><textarea value={text} onChange={(input) => setText(input.target.value)} placeholder="Message the host" rows={3} className="w-full rounded-xl border border-line px-3 py-2" /><button className="min-h-11 w-fit rounded-full bg-primary px-4 text-sm text-white">Send</button>{sent ? <p className="text-sm text-muted">Sent to the host. They reply in their inbox.</p> : null}<p className="text-xs text-muted">Your name and message go to the host. We keep enquiries for 12 months. See our <a href="/legal?page=privacy" className="text-primary">Privacy Notice</a>.</p></form> : <p className="text-sm text-muted">Log in to message the host.</p>}
          {event.website ? (
              <a href={event.website} target="_blank" rel="noreferrer" className="min-h-11 rounded-xl border border-line bg-white px-3 py-3 text-center text-sm font-medium text-primary">
                Contact them on their website
              </a>
            ) : null}
            {event.tickets && event.tickets !== event.website ? (
              <a href={event.tickets} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary">
                Ticket page
              </a>
            ) : null}
          </div>
        </details>
        {holdable ? (
          <Card>
            <p className="text-sm">
              {taken} of {places} places held.
            </p>
            {full ? <p className="mt-3 rounded-xl bg-warn-bg px-3 py-2 text-sm text-warn">This event is full.</p> : null}
            {message ? <p className="mt-3 text-sm">{message}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {account ? (
              <button
                type="button"
                className="min-h-11 rounded-full bg-primary px-4 text-sm font-medium text-white disabled:opacity-50"
                disabled={full && !mine}
                onClick={() => {
                  const result = reserve(event.id);
                  if (!result.ok) setMessage(result.reason);
                  else setMessage("Reserved. The code stays on this phone.");
                }}
              >
                {mine ? "Reservation held" : "Reserve a free place"}
              </button>
              ) : (<NeedsAccount next={`/event/${event.id}?from=${from}`} />)}
            </div>
            <p className="mt-3 text-xs text-muted">A free place only. Paid tickets keep a 10 percent fee. They are not sold here yet. The QR stays on this phone and opens again with no signal.</p>
            {mine?.id ? (
              <Link to="/ticket/$id" params={{ id: mine.id }} className="mt-4 inline-block text-sm font-medium text-primary">
                Open the QR on this phone
              </Link>
            ) : null}
          </Card>
        ) : null}
        {account ? (
        <button
          type="button"
          className="min-h-11 w-fit rounded-full border border-line px-4 text-sm"
          onClick={() => setReportOpen(true)}
        >
          {reportRef ? `Report sent · ${reportRef}` : "Report"}
        </button>
        ) : null}
        <button type="button" className="min-h-11 w-fit rounded-full border border-line px-4 text-sm" onClick={() => block(event.id)}>{blocked.includes(event.id) ? "Blocked" : "Block organiser"}</button>
        <ReportModal open={reportOpen} target="event" onClose={() => setReportOpen(false)} onSend={(reason, detail) => { const id = report(event.title, detail, reason); setReportRef(id); return id; }} />
        <p className="text-xs text-muted">If someone is in danger, call 999. This is not an emergency service.</p>
        </div>
    </Shell>
  );
}
