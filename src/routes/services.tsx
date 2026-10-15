import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AreaBar, useHere } from "@/components/common/AreaBar";
import { MapView } from "@/components/common/MapView";
import { Shell, NeedsAccount } from "@/components/common/Shell";
import { locationMessage, readPosition } from "@/lib/common/location";
import { tflBoard } from "@/lib/common/arrivals";
import { railBoard, taxiEstimate, type BoardRow } from "@/lib/common/departures";
import { COUNCIL_SERVICES, TRAVEL_SERVICES, type CouncilService } from "@/lib/common/services";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/services")({ component: ServicesPage });

function placeOf(row: CouncilService) {
  if (row.kind === "School") {
    return { name: "Lambeth Civic Centre", address: "6 Brixton Hill", postcode: "SW2 1EG" };
  }
  const match = row.address.match(/\b([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\b/i);
  const postcode = match?.[1]?.toUpperCase() ?? "";
  const address = match ? row.address.replace(match[0], "").replace(/,\s*$/, "").trim() : row.address;
  return { name: row.name, address, postcode };
}

function contactOf(row: CouncilService) {
  if (row.kind === "Hospital" && row.name.startsWith("King")) return { phone: "020 3299 9000", website: "https://www.kch.nhs.uk/" };
  if (row.kind === "Hospital") return { phone: "020 7188 7188", website: "https://www.guysandstthomas.nhs.uk/" };
  if (row.kind === "School") return { phone: "020 7926 1000", website: row.href };
  if (row.kind === "Taxi") return { phone: "", website: row.href };
  if (row.kind === "Bus" || row.kind === "Train") return { phone: "", website: row.href };
  if (row.kind === "Police") return { phone: "101", website: "https://www.met.police.uk/" };
  if (row.kind === "Fire") return { phone: "", website: "https://www.london-fire.gov.uk/" };
  if (row.kind === "Clinic") return { phone: "", website: "https://www.nhs.uk/service-search/find-a-gp" };
  return { phone: "", website: "https://www.nhs.uk/service-search/find-a-dentist" };
}

const boardCache = new Map<string, { at: number; rows: BoardRow[] }>();
const boardPending = new Map<string, Promise<BoardRow[]>>();

function loadBoard(label: string, mode: "bus" | "tfl" | "rail", fresh = false) {
  const key = `${mode}:${label}`;
  const cached = boardCache.get(key);
  if (!fresh && cached && Date.now() - cached.at < 45_000) return Promise.resolve(cached.rows);
  if (!fresh) {
    const pending = boardPending.get(key);
    if (pending) return pending;
  }
  const request = Promise.resolve(
    mode === "rail" ? railBoard({ data: label }) : tflBoard(label, mode === "bus" ? "bus" : "tube,overground,elizabeth-line,dlr"),
  )
    .then((rows) => {
      boardCache.set(key, { at: Date.now(), rows });
      boardPending.delete(key);
      return rows;
    })
    .catch((error: unknown) => {
      boardPending.delete(key);
      throw error;
    });
  boardPending.set(key, request);
  return request;
}

function LiveBoard({ label, mode }: { label: string; mode: "bus" | "tfl" | "rail" }) {
  const [rows, setRows] = useState<BoardRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setTick((count) => count + 1), 60000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    let gone = false;
    void loadBoard(label, mode, tick > 0)
      .then((list) => {
        if (!gone) {
          setRows(list);
          setFailed(false);
        }
      })
      .catch(() => {
        if (!gone) setFailed(true);
      });
    return () => {
      gone = true;
    };
  }, [label, mode, tick]);

  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{label}</p>
        <button type="button" onClick={() => setTick((count) => count + 1)} className="text-xs font-medium text-primary">Refresh</button>
      </div>
      <p className="text-[10px] text-muted">Sample times for this preview. Live TfL data needs an API key.</p>
      {rows === null && !failed ? <p className="mt-1 text-sm text-muted">Checking the next few…</p> : null}
      {failed ? <p className="mt-1 text-sm text-muted">Times are not available just now.</p> : null}
      {rows && rows.length === 0 ? <p className="mt-1 text-sm text-muted">Nothing listed in the next while.</p> : null}
      {rows?.map((item, index) => (
        <p key={`${item.line}-${item.destination}-${index}`} className="mt-1 flex items-baseline justify-between gap-3 text-sm">
          <span className="min-w-0 break-words">
            <span className="font-medium">{item.line}</span>
            <span className="text-muted"> {item.destination}</span>
            {item.note ? <span className="text-muted"> · {item.note}</span> : null}
          </span>
          <span className="shrink-0 font-medium">{item.minutes <= 0 ? "Due" : `${item.minutes} min`}</span>
        </p>
      ))}
    </div>
  );
}

function NextDeparture({ label, mode }: { label: string; mode: "bus" | "tfl" | "rail" }) {
  const [line, setLine] = useState("");
  useEffect(() => {
    let gone = false;
    void Promise.resolve(loadBoard(label, mode))
      .then((rows) => {
        const item = rows[0];
        if (!gone && item) setLine(`${label} · ${item.line} to ${item.destination} · ${item.minutes <= 0 ? "Due" : `${item.minutes} min`}`);
      })
      .catch(() => undefined);
    return () => {
      gone = true;
    };
  }, [label, mode]);
  if (!line) return null;
  return <span className="mt-1 block text-sm font-normal text-muted">{line}</span>;
}

function ServiceCard({ row, open, onToggle, preview, covers = [] }: { row: CouncilService; open: boolean; onToggle: () => void; preview: boolean; covers?: string[] }) {
  const account = useCommon((state) => state.account);
  const [origin, setOrigin] = useState("");
  const [start, setStart] = useState("");
  const [locateNote, setLocateNote] = useState("");
  const place = placeOf(row);
  const contact = contactOf(row);
  const [pickup, setPickup] = useState(place.address);
  const [dropOff, setDropOff] = useState("");
  const [taxiNote, setTaxiNote] = useState("");
  const [taxiBusy, setTaxiBusy] = useState(false);
  const [taxiRouted, setTaxiRouted] = useState(false);
  const routed = row.kind === "Taxi" && taxiRouted && dropOff.trim().length > 0;
  const mapPlace = routed ? { name: dropOff.trim(), address: dropOff.trim(), postcode: "" } : place;
  const mapOrigin = routed ? pickup : origin;
  const destination = `${mapPlace.name}, ${mapPlace.address}, ${mapPlace.postcode}, London`;
  const routeHref = mapOrigin
    ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(mapOrigin)}&destination=${encodeURIComponent(destination)}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;

  function useMyLocation() {
    setLocateNote("Finding where you are…");
    void readPosition()
      .then((position) => {
        setStart("");
        setOrigin(`${position.coords.latitude},${position.coords.longitude}`);
        setLocateNote("Using your location.");
      })
      .catch((error: unknown) => {
        setLocateNote(locationMessage(error, "This browser has no location. Type a starting point instead."));
      });
  }

  return (
    <article className="min-w-0 border-b border-line pb-3">
      <button type="button" onClick={onToggle} aria-expanded={open} className="block w-full min-w-0 text-left">
        <p className="text-xs tracking-wide text-muted">
          <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">{covers.length > 1 ? "Lambeth" : row.neighbourhood}</span>
          {row.kind}
        </p>
        <h2 className="mt-1 break-words font-serif text-xl leading-tight">{row.name}</h2>
        {covers.length > 1 ? <p className="mt-1 text-xs text-muted">Covers {covers.join(", ")}</p> : null}
        {!open && preview && row.links?.length ? (
          <span className="mt-1 grid gap-1">
            {row.links.map((link) => (
              <NextDeparture key={link.label} label={link.label} mode={link.mode ?? (row.kind === "Bus" ? "bus" : "rail")} />
            ))}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="mt-2 grid gap-3">
          <p className="text-sm leading-relaxed">{row.detail}</p>
          {row.kind === "Taxi" ? (
            account ? (
            <form
              className="grid gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (!dropOff.trim()) {
                  setTaxiNote("Add where you are going.");
                  return;
                }
                setTaxiBusy(true);
                setTaxiNote("Working out the road time…");
                setTaxiRouted(true);
                void taxiEstimate({ data: { from: pickup, to: dropOff.trim() } })
                  .then((quote) => {
                    setTaxiNote(
                      quote
                        ? `Request held on this phone. About ${quote.minutes} min by road, ${quote.miles} miles. A licensed cab still has to confirm. Nothing is booked.`
                        : "Request held on this phone. A road time could not be worked out from those places. Nothing is booked.",
                    );
                  })
                  .catch(() => {
                    setTaxiNote("Request held on this phone. The road time is not available just now. Nothing is booked.");
                  })
                  .finally(() => setTaxiBusy(false));
              }}
            >
              <label className="grid gap-1 text-sm">
                Pickup
                <input value={pickup} onChange={(event) => setPickup(event.target.value)} className="min-h-11 rounded-xl border border-line bg-white px-3" />
              </label>
              <label className="grid gap-1 text-sm">
                Where to
                <input value={dropOff} onChange={(event) => setDropOff(event.target.value)} placeholder="A street, station or postcode" className="min-h-11 rounded-xl border border-line bg-white px-3" />
              </label>
              <button type="submit" disabled={taxiBusy} className="min-h-11 rounded-xl bg-primary px-3 text-sm font-medium text-white">Request a taxi</button>
              {taxiNote ? <p className="text-sm">{taxiNote}</p> : null}
            </form>
            ) : <NeedsAccount next="/services" />
          ) : null}
          {row.links?.length ? (
            <div className="grid gap-2">
              {row.links.map((link) => (
                <LiveBoard key={link.label} label={link.label} mode={link.mode ?? (row.kind === "Bus" ? "bus" : "rail")} />
              ))}
            </div>
          ) : null}
          <p className="text-sm">{row.kind === "School" ? "Lambeth Civic Centre, 6 Brixton Hill, London SW2 1EG" : `${place.address}, London ${place.postcode}`}</p>
          {row.kind === "School" ? <p className="text-xs text-muted">The pin is the council centre, where school admissions are handled. It is not a school.</p> : null}
          <MapView place={mapPlace} origin={mapOrigin || undefined} />
          <form
            className="grid gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (start.trim()) setOrigin(start.trim());
            }}
          >
            <label className="grid gap-1 text-sm">
              Starting point
              <input value={start} onChange={(event) => setStart(event.target.value)} placeholder="A street, station or postcode" className="min-h-11 rounded-xl border border-line bg-white px-3" />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button type="submit" className="min-h-11 rounded-xl bg-primary px-3 text-sm font-medium text-white">Directions</button>
              <button type="button" className="min-h-11 rounded-xl border border-primary bg-white px-3 text-sm font-medium text-primary" onClick={useMyLocation}>Use my location</button>
            </div>
          </form>
          {locateNote ? <p className="text-sm text-muted">{locateNote}</p> : null}
          <a className="text-sm font-medium text-primary" href={routeHref} target="_blank" rel="noreferrer">Open the route in Google Maps</a>
          {row.kind === "Bus" || row.kind === "Train" ? null : (
          <div className="grid gap-2">
            <p className="text-sm font-medium">Contact details</p>
            {contact.phone ? (
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="min-h-11 rounded-xl bg-primary px-3 py-3 text-center text-sm font-medium text-white">Call {contact.phone}</a>
            ) : row.kind === "Taxi" || row.kind === "Fire" ? null : (
              <p className="text-sm text-muted">No phone number was published for this practice.</p>
            )}
            {row.kind === "Hospital" || row.kind === "Police" || row.kind === "Fire" ? (
              <a href="tel:999" className="min-h-11 rounded-xl bg-[#8a1c1c] px-3 py-3 text-center text-sm font-medium text-white">Call for help</a>
            ) : null}
            {contact.website ? (
              <a href={contact.website} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary">
                {row.kind === "School" ? "Council school list" : row.kind === "Police" ? "Metropolitan Police" : row.kind === "Fire" ? "London Fire Brigade" : row.kind === "Hospital" ? "Open the website" : row.kind === "Taxi" ? "Licensed taxis on TfL" : "Find them on the NHS"}
              </a>
            ) : null}
          </div>
          )}
        </div>
      ) : null}
    </article>
  );
}

function ReportForm({ service, neighbourhood }: { service: "police" | "fire"; neighbourhood: string }) {
  const account = useCommon((state) => state.account);
  const fileIncident = useCommon((state) => state.fileIncident);
  const [description, setDescription] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [name, setName] = useState("");
  const [imageName, setImageName] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaKind, setMediaKind] = useState<"image" | "video" | "">("");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const fire = service === "fire";
  if (!account) {
    return (
      <div className="grid gap-2 rounded-2xl border border-line bg-white p-4">
        <h2 className="font-serif text-xl">{fire ? "Fire service" : "Incident report"}</h2>
        {fire ? <a href="tel:999" className="min-h-11 rounded-xl bg-[#9a3412] px-3 py-3 text-center text-sm font-medium text-white">Request assistance · 999</a> : <a href="tel:999" className="min-h-11 rounded-xl bg-[#8a1c1c] px-3 py-3 text-center text-sm font-medium text-white">Call 999</a>}
        <NeedsAccount next="/services" />
      </div>
    );
  }

  function onFile(file: File | undefined) {
    setNote("");
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    setImageName("");
    setMediaUrl("");
    setMediaKind("");
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setNote("Please use a photo or a video.");
      return;
    }
    setImageName(file.name);
    setMediaKind(file.type.startsWith("video/") ? "video" : "image");
    setMediaUrl(URL.createObjectURL(file));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!description.trim()) {
      setNote("Add a short description so the report is useful.");
      return;
    }
    if (!anonymous && !name.trim()) {
      setNote("Add your name, or tick remain anonymous.");
      return;
    }
    fileIncident({ neighbourhood, service, description, anonymous, name, imageName });
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    setDone(true);
    setNote("");
    setDescription("");
    setName("");
    setImageName("");
    setMediaUrl("");
    setMediaKind("");
  }

  return (
    <form onSubmit={submit} className="grid gap-2 rounded-2xl border border-line bg-white p-4">
      <h2 className="font-serif text-xl">{fire ? "Fire service" : "Incident report"}</h2>
      <p className="text-sm text-muted">
        {fire
          ? "If there is a fire, smoke, or someone is trapped, call 999 now. A request or report stays on this phone. It does not go to the fire service yet."
          : "Take a photo or video with your camera, or upload one. Send report stays on this phone. It does not go to the police yet."}
      </p>
      {fire ? (
        <a href="tel:999" className="min-h-11 rounded-xl bg-[#9a3412] px-3 py-3 text-center text-sm font-medium text-white">Request assistance · 999</a>
      ) : null}
      <label className="grid gap-1 text-sm">
        {fire ? "What assistance do you need?" : "What happened"}
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="rounded-xl border border-line px-3 py-2" placeholder={fire ? "Where it is, and what you can see" : "Where, when, and what you saw"} />
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="rounded-full border border-line px-3 py-1.5 text-sm" onClick={() => photoRef.current?.click()}>Take a photo</button>
        <button type="button" className="rounded-full border border-line px-3 py-1.5 text-sm" onClick={() => videoRef.current?.click()}>Record a video</button>
        <button type="button" className="rounded-full border border-line px-3 py-1.5 text-sm" onClick={() => uploadRef.current?.click()}>Upload</button>
      </div>
      <input ref={photoRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => onFile(event.target.files?.[0])} />
      <input ref={videoRef} type="file" accept="video/*" capture="environment" className="hidden" onChange={(event) => onFile(event.target.files?.[0])} />
      <input ref={uploadRef} type="file" accept="image/*,video/*" className="hidden" onChange={(event) => onFile(event.target.files?.[0])} />
      {mediaUrl && mediaKind === "image" ? (
        <div className="overflow-hidden rounded-xl">
          <img src={mediaUrl} alt="" className="h-36 w-full object-cover" />
        </div>
      ) : null}
      {mediaUrl && mediaKind === "video" ? (
        <div className="overflow-hidden rounded-xl bg-black">
          <video src={mediaUrl} controls className="block h-36 w-full object-cover" />
        </div>
      ) : null}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />
        Remain anonymous
      </label>
      {anonymous ? null : (
        <label className="grid gap-1 text-sm">
          Your name
          <input value={name} onChange={(event) => setName(event.target.value)} className="rounded-xl border border-line px-3 py-2" />
        </label>
      )}
      {note ? <p className="text-sm text-warn">{note}</p> : null}
      {done ? (
        <p className="text-sm">
          {fire ? (
            <>
              Held on this phone. It has not gone anywhere. In a fire, call 999. For fire safety advice, use{" "}
              <a className="font-medium text-primary" href="https://www.london-fire.gov.uk/" target="_blank" rel="noreferrer">the London Fire Brigade site</a>.
            </>
          ) : (
            <>
              Held on this phone. It has not gone anywhere. To give it to the police, call 101 or use{" "}
              <a className="font-medium text-primary" href="https://www.met.police.uk/" target="_blank" rel="noreferrer">the Metropolitan Police site</a>.
            </>
          )}
        </p>
      ) : null}
      <button type="submit" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white">{fire ? "Send request" : "Send report"}</button>
    </form>
  );
}

function CouncilNote() {
  const fileCouncilNote = useCommon((state) => state.fileCouncilNote);
  const here = useHere();
  const [kind, setKind] = useState<"complaint" | "suggestion" | "concern">("concern");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <form className="mt-3 grid gap-2 rounded-2xl border border-line bg-white p-3" onSubmit={(event) => { event.preventDefault(); if (!body.trim()) return; fileCouncilNote({ kind, neighbourhood: here?.neighbourhood || "Lambeth", body, name: "" }); setSent(true); setBody(""); }}>
      <p className="text-sm font-medium">Write to the council</p>
      <p className="text-xs text-muted">A complaint, a suggestion or a concern. It stays on this phone for the council desk.</p>
      <select className="min-h-11 rounded-xl border border-line px-3" value={kind} onChange={(event) => setKind(event.target.value as typeof kind)}>
        <option value="complaint">Complaint</option>
        <option value="suggestion">Suggestion</option>
        <option value="concern">Concern</option>
      </select>
      <textarea rows={4} className="rounded-xl border border-line px-3 py-2" value={body} onChange={(event) => setBody(event.target.value)} placeholder="What should the council know?" />
      <button className="min-h-11 w-fit rounded-full bg-primary px-4 text-sm font-medium text-white">Send</button>
      {sent ? <p className="text-xs text-muted">Held for the council desk. It has not been emailed.</p> : null}
    </form>
  );
}
function ServicesPage() {
  const here = useHere();
  const serviceEdits = useCommon((state) => state.serviceEdits ?? {});
  const hiddenServices = useCommon((state) => state.hiddenServices ?? []);
  const [urgent, setUrgent] = useState<null | "police" | "fire">(null);
  const [open, setOpen] = useState<string | null>(null);
  const [kind, setKind] = useState<"All" | CouncilService["kind"]>("All");
  const rank = (row: CouncilService) => (row.kind === "Police" ? 0 : row.kind === "Fire" ? 1 : row.kind === "Hospital" ? 2 : 3);
  const sharedKinds = new Set(["Police", "Fire", "Hospital"]);
  const groups = new Map<string, { row: CouncilService; covers: string[] }>();
  for (const row of COUNCIL_SERVICES) {
    if (!sharedKinds.has(row.kind) || (kind !== "All" && row.kind !== kind)) continue;
    const key = `${row.kind}|${row.name}`;
    const group = groups.get(key) ?? { row, covers: [] };
    if (!group.covers.includes(row.neighbourhood)) group.covers.push(row.neighbourhood);
    groups.set(key, group);
  }
  const shared = [...groups.values()].filter((group) => group.covers.includes(here.neighbourhood)).sort((a, b) => rank(a.row) - rank(b.row));
  const local = [...TRAVEL_SERVICES, ...COUNCIL_SERVICES.map((row) => ({ ...row, ...serviceEdits[row.id] })).filter((row) => !hiddenServices.includes(row.id))].filter((row) => !sharedKinds.has(row.kind) && row.neighbourhood === here.neighbourhood && (kind === "All" || row.kind === kind));
  const ordered = [...shared.map((group) => group.row), ...local];
  const coversFor = (row: CouncilService) => groups.get(`${row.kind}|${row.name}`)?.covers ?? [];

  return (
    <Shell>
      <div className="grid min-w-0 gap-3">
        <div>
        <h1 className="font-serif text-3xl text-deep">Lambeth · Community Services</h1>
          <p className="mt-1 text-sm text-muted">Trusted local contacts. Save the numbers you might need. If someone is in danger, call 999.</p>
        </div>
        <p className="text-sm font-medium text-warn">The Common can't contact the emergency services for you.</p>
        <div className="grid grid-cols-3 items-stretch gap-2">
          <a href="tel:999" className="flex min-h-24 flex-col rounded-2xl bg-[#003820] px-2.5 py-3 text-left text-white">
            <span className="block text-xs font-bold tracking-[0.08em] text-white">EMERGENCY</span>
            <span className="mt-1 block text-base leading-tight">Call 999</span>
          </a>
          <a href="tel:101" className="flex min-h-24 flex-col rounded-2xl bg-[#9A3412] px-2.5 py-3 text-left text-white">
            <span className="block text-xs font-bold tracking-[0.08em] text-white">POLICE</span>
            <span className="mt-1 block text-base leading-tight">Call 101</span>
          </a>
          <a href="https://www.met.police.uk/ro/report" target="_blank" rel="noreferrer" className="flex min-h-24 flex-col rounded-2xl bg-[#8A1C1C] px-2.5 py-3 text-left text-white">
            <span className="block text-xs font-bold tracking-[0.08em] text-white">REPORT</span>
            <span className="mt-1 block text-base leading-tight">Report online with the Met</span>
          </a>
        </div>
        <a href="https://www.london-fire.gov.uk/" target="_blank" rel="noreferrer" className="text-sm font-medium text-primary">Fire safety advice: London Fire Brigade</a>
        <a href="tel:111" className="text-sm font-medium text-primary">NHS 111 if it is urgent but not an emergency</a>
        {urgent ? <ReportForm key={urgent} service={urgent} neighbourhood={here.neighbourhood} /> : null}
        <AreaBar here={here} />
        <label className="grid gap-1 text-sm">
          <span className="text-sm font-medium text-[#1A2E24]">Service type</span>
          <select aria-label="Service type" value={kind} onChange={(event) => setKind(event.target.value as typeof kind)} className="min-h-11 rounded-xl border border-line bg-white px-3">
            <option value="All">All services</option>
            <option value="Police">Police</option>
            <option value="Fire">Fire</option>
            <option value="Hospital">Hospitals</option>
            <option value="Clinic">Clinics</option>
            <option value="Dentist">Dentists</option>
            <option value="School">Schools</option>
            <option value="Taxi">Request a taxi</option>
            <option value="Bus">Bus times</option>
            <option value="Train">Train times</option>
          </select>
        </label>
        <p className="text-sm text-muted">Your nearest services first. Choose an area or share your location to sort the list.</p>
        {ordered.map((row) => (
          <ServiceCard key={row.id} row={row} covers={coversFor(row)} preview={row.neighbourhood === here.neighbourhood} open={open === row.id} onToggle={() => setOpen((current) => (current === row.id ? null : row.id))} />
        ))}
        <CouncilNote />
      </div>
    </Shell>
  );
}
