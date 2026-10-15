import { useState } from "react";
import { EVENT_KINDS, type EventKind } from "@/lib/common/model";
import { useCommon } from "@/lib/common/store";
import { isLambethPostcode, lookupPostcode } from "@/lib/common/boundaries";
import { pictureFor } from "@/lib/common/pictures";
import { CopyAssist } from "@/components/common/CopyAssist";

export function EventForm({ businessId }: { businessId: string }) {
  const postEvent = useCommon((state) => state.postEvent);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [sell, setSell] = useState(false);
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [street, setStreet] = useState("");
  const [town, setTown] = useState("");
  const [county, setCounty] = useState("Greater London");
  const [postcode, setPostcode] = useState("");
  const [image, setImage] = useState("");
  const [video, setVideo] = useState("");
  const [kind, setKind] = useState<EventKind>("Community");
  const [price, setPrice] = useState("");
  const [sent, setSent] = useState(false);
  const area = lookupPostcode(postcode);

  return (
    <form className="grid w-full min-w-0 max-w-full gap-3 overflow-x-hidden" onSubmit={(event) => {
      event.preventDefault();
      if (!isLambethPostcode(postcode)) { setNote("Use a Lambeth postcode. Other boroughs are not accepted yet."); return; }
      const place = [number, street, town, county, postcode].filter(Boolean).join(", ");
      const ok = postEvent({ businessId, title, detail, when: `${date} ${time}`.trim(), kind, place, postcode, website, phone, email, tickets: sell, ticketPrice: sell ? Math.round(Number(price) * 100) : 0, image, video });
      if (!ok) { setNote("Add an event name, a description, and a Lambeth postcode."); return; }
      setTitle(""); setDetail(""); setDate(""); setTime(""); setSent(true); setNote("");
    }}>
      <label className="grid gap-1 text-sm">Event image
        <input type="file" accept="image/*" className="text-xs" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setImage(String(reader.result || "")); reader.readAsDataURL(file); }} />
        {image ? <img src={image} alt="" className="mt-2 h-28 w-full rounded-2xl object-cover" /> : <img src={pictureFor(`${title} ${kind} ${detail}`, "event")} alt="" className="mt-2 h-28 w-full rounded-2xl object-cover" />}
      </label>
      <label className="grid gap-1 text-sm">Event video
        <input type="file" accept="video/*" className="text-xs" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setVideo(String(reader.result || "")); reader.readAsDataURL(file); }} />
      </label>
      <label className="grid min-w-0 gap-1 text-sm">Event name
        <input value={title} onChange={(event) => setTitle(event.target.value.slice(0, 80))} placeholder="Event name" required maxLength={80} className="box-border min-h-11 w-full min-w-0 max-w-full rounded-xl border border-line bg-bg px-3" />
      </label>
      <p className="text-xs text-muted">{title.length}/80</p>
      <label className="grid min-w-0 gap-1 text-sm">Event description
        <textarea value={detail} onChange={(event) => setDetail(event.target.value.slice(0, 500))} placeholder="Event description" required maxLength={500} rows={4} className="box-border w-full min-w-0 max-w-full rounded-xl border border-line bg-bg px-3 py-2" />
      </label>
      <p className="text-xs text-muted">{detail.length}/500</p>
      <CopyAssist kind="event" name={title} notes={detail} when={`${date} ${time}`.trim()} place={[number, street, town, postcode].filter(Boolean).join(", ")} onDraft={(text) => setDetail(text.slice(0, 500))} />
      <label className="grid min-w-0 max-w-full gap-1 overflow-hidden text-sm">Date
        <input type="date" aria-label="Event date" value={date} onChange={(event) => setDate(event.target.value)} required className="box-border block min-h-11 w-full min-w-0 max-w-full rounded-xl border border-line bg-bg px-3" />
      </label>
      <label className="grid min-w-0 max-w-full gap-1 overflow-hidden text-sm">Time
        <input type="time" aria-label="Event time" value={time} onChange={(event) => setTime(event.target.value)} required className="box-border block min-h-11 w-full min-w-0 max-w-full rounded-xl border border-line bg-bg px-3" />
      </label>
      <input value={number} onChange={(event) => setNumber(event.target.value)} placeholder="Number" className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line bg-bg px-3" />
      <input value={street} onChange={(event) => setStreet(event.target.value)} placeholder="Street name" className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line bg-bg px-3" />
      <input value={town} onChange={(event) => setTown(event.target.value)} placeholder="Town or city" className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line bg-bg px-3" />
      <input value={county} onChange={(event) => setCounty(event.target.value)} placeholder="County" className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line bg-bg px-3" />
      <input value={postcode} onChange={(event) => setPostcode(event.target.value.toUpperCase())} placeholder="Postcode" required className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line bg-bg px-3" />
      {postcode ? <p className="text-xs text-muted">{area ? `Neighbourhood: ${area.discoveryName}` : "That postcode is outside Lambeth."}</p> : null}
      <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Telephone" className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line bg-bg px-3" />
      <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line bg-bg px-3" />
      <input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="Website" className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line bg-bg px-3" />
      <p className="text-sm text-muted">Events are free to attend at launch. Guests reserve a free place.</p>
      <select aria-label="Event type" value={kind} onChange={(event) => setKind(event.target.value as EventKind)} className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line bg-bg px-3">{EVENT_KINDS.map((name) => <option key={name} value={name}>{name}</option>)}</select>
      <button type="submit" className="min-h-11 w-fit rounded-full bg-primary px-4 text-sm font-medium text-on-primary">Submit for approval</button>
      {note ? <p className="text-sm text-warn">{note}</p> : null}
      {sent ? <p className="text-sm text-muted">Sent to the admin desk. It is not public until it is approved.</p> : null}
    </form>
  );
}
