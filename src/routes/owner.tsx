import { createFileRoute, Link } from "@tanstack/react-router";
import React, { lazy, Suspense, useState } from "react";
import { BackButton, Card, Shell, backButtonClass } from "@/components/common/Shell";
import { EVENT_KINDS, areaFor, ownsRecord, type EventKind } from "@/lib/common/model";
import { logoFor, pictureFor } from "@/lib/common/pictures";
import { SUPER_EMAIL } from "@/lib/common/staff";
import { useCommon } from "@/lib/common/store";

const CopyAssist = lazy(() => import("@/components/common/CopyAssist").then((m) => ({ default: m.CopyAssist })));
const EventForm = lazy(() => import("@/components/common/EventForm").then((m) => ({ default: m.EventForm })));

export const Route = createFileRoute("/owner")({
  validateSearch: (search: Record<string, unknown>) => ({ section: ["edit","offers","team","events","listings"].includes(String(search.section)) ? search.section : "" }),
  component: OwnerPage,
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function OwnerPage() {
  const account = useCommon((state) => state.account);
  const businesses = useCommon((state) => state.businesses);
  const events = useCommon((state) => state.events);
  const listings = useCommon((state) => state.listings);
  const bookings = useCommon((state) => state.bookings);
  const enquiries = useCommon((state) => state.enquiries);
  const follows = useCommon((state) => state.follows);
  const favourites = useCommon((state) => state.favourites);
  const ratings = useCommon((state) => state.ratings);
  const offers = useCommon((state) => state.offers);
  const submitBusiness = useCommon((state) => state.submitBusiness);
  const updateBusiness = useCommon((state) => state.updateBusiness);
  const updateEvent = useCommon((state) => state.updateEvent);
  const removeEvent = useCommon((state) => state.removeEvent);
  const removeListing = useCommon((state) => state.removeListing);
  const removeOffer = useCommon((state) => state.removeOffer);
  const setMember = useCommon((state) => state.setMember);
  const removeMember = useCommon((state) => state.removeMember);
  const directory = useCommon((state) => state.directory ?? []);
  const saveOffer = useCommon((state) => state.saveOffer);
  const resubmit = useCommon((state) => state.resubmit);
  const appeal = useCommon((state) => state.appeal);
  const superUser = account?.email?.toLowerCase() === SUPER_EMAIL;
  const issueClaim = useCommon((state) => state.issueClaim);
  const claimBusiness = useCommon((state) => state.claimBusiness);
  const [claimCode, setClaimCode] = useState("");
  const [claimNote, setClaimNote] = useState("");
  const mine = superUser ? businesses : businesses.filter((row) => ownsRecord(row, account));
  const [selected, setSelected] = useState(mine[0]?.id ?? "");
  const business = mine.find((row) => row.id === selected) ?? mine[0];
  const [form, setForm] = useState({ name: "", address: "", postcode: "", phone: "", email: "", hours: "Mon 09:00–17:00" });
  const [saved, setSaved] = useState("");

  if (!account) {
    return (
      <Shell>
        <Card>
          <h1 className="font-serif text-3xl text-deep">Business dashboard</h1>
          <p className="mt-2 text-sm">Sign in with the business account before you open the dashboard.</p>
          <Link to="/login" search={{ next: "/owner" }} className="mt-3 inline-block text-sm font-medium text-primary">Log in</Link>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="grid gap-4">
        <div>
          <h1 className="font-serif text-3xl text-deep">{mine.length === 1 ? mine[0].name : "My business"}</h1>
        </div>
        {mine.length === 0 ? (
          <Card>
            <h2 className="text-lg">Create a business</h2>
            <form className="mt-3 grid gap-3" onSubmit={(event) => { event.preventDefault(); submitBusiness(form); }}>
              {(["name", "address", "postcode", "phone", "email"] as const).map((field) => (
                <label key={field} className="grid gap-1 text-sm capitalize">{field}<input required className="min-h-11 rounded-xl border border-line bg-bg px-3" value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} /></label>
              ))}
              <button type="submit" className="min-h-11 w-fit rounded-full bg-primary px-4 text-sm font-medium text-on-primary">Submit for approval</button>
            </form>
          </Card>
        ) : (
          <>
            <label className="grid gap-1 text-sm">
              Business
              <select className="min-h-11 w-full rounded-xl border border-line bg-white px-3" value={business?.id || ""} onChange={(event) => setSelected(event.target.value)}>
                {mine.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
              </select>
            </label>
            {superUser ? <p className="text-xs text-muted">Hidden access. Issuing a code does not remove it.</p> : null}
            {business ? (
              <BusinessDesk
                section={Route.useSearch().section}
                key={business.id}
                business={business}
                superUser={superUser}
                onIssue={() => { const code = issueClaim(business.id); setClaimNote(code ? `Code for ${business.name}: ${code}` : "Only the super user can issue a code."); }}
                events={events.filter((row) => row.businessId === business.id)}
                listings={listings.filter((row) => row.businessId === business.id)}
                bookings={bookings.filter((row) => row.businessId === business.id)}
                comments={enquiries.filter((row) => row.businessId === business.id)}
                likes={(favourites ?? []).filter((id) => id === business.id).length}
                follows={follows.filter((id) => id === business.id).length}
                ratings={(ratings ?? []).filter((row) => row.businessId === business.id)}
                offers={(offers ?? []).filter((row) => row.businessId === business.id)}
                saved={saved}
                onSave={(input: { name: string; about: string; address: string; postcode: string; phone: string; email: string; hours: string; cover?: string; reel?: string; menu?: { name: string; price: string; detail: string; service: string }[] }) => { updateBusiness(business.id, input); setSaved("Saved on this phone."); }}
                onOffer={(input: { id?: string; title: string; detail: string; price?: string; image?: string }) => saveOffer(business.id, input)}
                onResubmit={() => resubmit(business.id)}
                onAppeal={() => appeal(business.id)}
                onDeleteEvent={(id: string) => removeEvent(id)}
                onDeleteListing={(id: string) => removeListing(id)}
                onDeleteOffer={(id: string) => removeOffer(id)}
                onEvent={(id: string, input: { title: string; when: string; kind: EventKind; place: string; detail: string; image?: string; tickets?: string; capacity?: number; phone?: string; email?: string; website?: string }) => updateEvent(id, input)}
              />
            ) : null}
          </>
        )}
      </div>
    </Shell>
  );
}

function BusinessDesk({ section = "", business, events, listings, bookings, comments, likes, follows, ratings, offers, saved, onSave, onOffer, onResubmit, onAppeal, onEvent, onDeleteEvent, onDeleteListing, onDeleteOffer, superUser, onIssue, setMember, removeMember, directory }: any) {
  const account = useCommon((state) => state.account);
  const audit = useCommon((state) => state.audit ?? []);
  const [edit, setEdit] = useState({ name: business.name, about: business.about, address: business.address, postcode: business.postcode, phone: business.phone, email: business.email, hours: business.hours, cover: business.cover || "", reel: business.reel || "", gallery: business.gallery || ["", "", "", ""], video: business.video || "", specialHours: business.specialHours || [], hero: business.hero || business.cover || "", social: business.social || { instagram: "", facebook: "", tiktok: "", x: "" }, website: business.website || "", logo: business.logo || "", chatOn: business.chatOn !== false, bookingOn: business.bookings !== false, appointmentOn: business.appointments !== false, eventQuery: "" });
  const [menu, setMenu] = useState(business.menu ?? []);
  const [sections, setSections] = useState<string[]>(Array.from(new Set((business.menu ?? []).map((item: { service: string }) => item.service).filter(Boolean))));
  const [sectionName, setSectionName] = useState("");
  const [showComments, setShowComments] = useState(false);
  const average = ratings.length ? (ratings.reduce((sum: number, row: { stars: number }) => sum + row.stars, 0) / ratings.length).toFixed(1) : "–";
  const area = areaFor(business.postcode);
  return (
    <>
      <Card>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <img src={business.hero || business.cover || pictureFor(`${business.name} ${business.category}`, "business")} alt="" className="h-24 w-24 rounded-3xl object-cover" />
            <img src={logoFor(business.logo, business.id)} alt="" className="absolute -right-2 -bottom-2 h-10 w-10 rounded-full bg-black object-cover ring-2 ring-white" />
          </div>
          <div className="grid gap-2">
            <h2 className="font-serif text-3xl text-deep">{business.name}</h2>
            <p className="text-sm text-muted">{area ? area.discoveryName : "Area not matched"} · {business.trade || "Business"}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="rounded-full bg-primary px-3 py-1 text-xs text-white">{business.status === "published" ? "Published" : business.status.replaceAll("_", " ")}</span>
              <Link to="/owner" search={{ section: "edit" }} className="rounded-full bg-band px-3 py-1 text-xs text-muted">Profile {Math.round(([business.name, business.about, business.address, business.postcode, business.phone, business.email, business.hours, business.cover, business.website, (business.menu || []).length].filter(Boolean).length / 10) * 100)}% complete</Link>
            </div>
          </div>
        </div>
{section ? null : <><div className="mt-3 grid grid-cols-3 gap-2">
          <p className="rounded-2xl bg-band p-3 text-sm"><span className="block font-serif text-2xl text-deep">{business.views || 0}</span>Page views</p>
          <p className="rounded-2xl bg-band p-3 text-sm"><span className="block font-serif text-2xl text-deep">{(business.clicks || 0) + (business.directions || 0)}</span>Customer actions</p>
          <p className="rounded-2xl bg-band p-3 text-sm"><span className="block font-serif text-2xl text-deep">{comments.length}</span>Enquiries</p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link to="/owner" search={{ section: "edit" }} className="grid min-h-24 place-items-center rounded-2xl border border-line p-3 text-center text-sm font-medium">Edit profile</Link>
          <Link to="/owner" search={{ section: "offers" }} className="grid min-h-24 place-items-center rounded-2xl border border-line p-3 text-center text-sm font-medium">Offers and promotions</Link>
          <Link to="/inbox" className="grid min-h-24 place-items-center rounded-2xl border border-line p-3 text-center text-sm font-medium">Bookings and enquiries</Link>
          <Link to="/owner" search={{ section: "team" }} className="grid min-h-24 place-items-center rounded-2xl border border-line p-3 text-center text-sm font-medium">Team and settings</Link>
          <Link to="/owner" search={{ section: "events" }} className="grid min-h-24 place-items-center rounded-2xl border border-line p-3 text-center text-sm font-medium">Events</Link>
          <Link to="/owner" search={{ section: "listings" }} className="grid min-h-24 place-items-center rounded-2xl border border-line p-3 text-center text-sm font-medium">Listings</Link>
          <Link to="/business/$id" params={{ id: business.id }} search={{ from: "" }} className="grid min-h-24 place-items-center rounded-2xl border border-line p-3 text-center text-sm font-medium">Preview public profile</Link>
          <Link to="/stats" search={{ business: business.id }} className="grid min-h-24 place-items-center rounded-2xl border border-line p-3 text-center text-sm font-medium">Statistics</Link>
        </div></>}
        {business.reason ? <p className="mt-2 text-sm text-muted">Approval note: {business.reason}</p> : null}
        {business.status === "changes_requested" ? <button type="button" className="mt-3 min-h-11 rounded-full bg-primary px-4 text-sm font-medium text-white" onClick={onResubmit}>Resubmit</button> : null}
        {business.status === "refused" && business.appeal === "none" ? <button type="button" className="mt-3 min-h-11 rounded-full border border-line px-4 text-sm" onClick={onAppeal}>Appeal</button> : null}
      </Card>
      {section === "edit" || section === "offers" ? <Card>
        <div className="mb-3"><h2 className="text-lg">{section === "offers" ? "Offers and promotions" : section === "team" ? "Team and settings" : section === "events" ? "Events" : section === "listings" ? "Listings" : "Edit profile"}</h2></div>
        <form className="mt-3 grid w-full min-w-0 max-w-full gap-3 overflow-hidden" onSubmit={(event) => { event.preventDefault(); onSave({ ...edit, bookings: edit.bookingOn, appointments: edit.appointmentOn, chatOn: edit.chatOn, menu, gallery: edit.gallery, video: edit.video, hero: edit.hero || edit.cover, cover: edit.hero || edit.cover, social: edit.social, specialHours: edit.specialHours }); }}>
          {section === "edit" ? <><details id="details" open className="min-w-0 rounded-2xl border border-line p-3">
            <summary className="cursor-pointer text-sm font-medium">Business name and description</summary>
            <div className="mt-3 grid min-w-0 gap-3">
          <div className="grid gap-2">
            <p className="text-sm font-medium">Details</p>
          <label className="grid min-w-0 gap-1 text-sm">Name<input maxLength={60} className="box-border min-h-11 w-full min-w-0 max-w-full rounded-xl border border-line bg-bg px-3" value={edit.name} onChange={(event) => setEdit({ ...edit, name: event.target.value.slice(0, 60) })} /></label>
          <p className="text-xs text-muted">{edit.name.length}/60</p>
          <label className="grid min-w-0 gap-1 text-sm">About<textarea maxLength={1000} rows={5} className="box-border w-full min-w-0 max-w-full rounded-xl border border-line bg-bg px-3 py-2" value={edit.about} onChange={(event) => setEdit({ ...edit, about: event.target.value.slice(0, 1000) })} /></label>
          <p className="text-xs text-muted">{edit.about.length}/1000</p>
          <Suspense fallback={<p className="text-xs text-muted">Loading writing help…</p>}><CopyAssist kind="business" name={edit.name} notes={edit.about} place={edit.address} onDraft={(about) => setEdit({ ...edit, about: about.slice(0, 1000) })} /></Suspense>
          <p className="text-xs text-muted">Name and about go for approval. The live page stays up until then.</p>
          </div>
          </div>
          </details>
          <details className="min-w-0 rounded-2xl border border-line p-3">
            <summary className="cursor-pointer text-sm font-medium">Business logo</summary>
            <div className="mt-3 grid gap-2">
              <p className="text-xs text-muted">Use a PNG with a transparent background, 1024 × 1024 px, up to 5 MB.</p>
              <img src={logoFor(edit.logo || business.logo, business.id)} alt="" className="h-16 w-16 rounded-full bg-black object-cover" />
              <input type="file" accept="image/png,image/jpeg,image/webp" className="text-sm" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setEdit({ ...edit, logo: String(reader.result) }); reader.readAsDataURL(file); }} />
            </div>
          </details>
          <details className="min-w-0 rounded-2xl border border-line p-3">
            <summary className="cursor-pointer text-sm font-medium">Pictures and video</summary>
            <div className="mt-3 grid gap-2">
              <p className="text-xs text-muted">Upload the header pictures and a short video. Choose the hero for the business list.</p>
              <ImageField label="Hero picture" value={edit.hero || edit.cover || pictureFor(`${edit.name} ${business.category}`, "business")} onChange={(hero) => setEdit({ ...edit, hero, cover: hero })} />
              {[0, 1, 2, 3].map((slot) => <ImageField key={slot} label={`Carousel picture ${slot + 1}`} value={edit.gallery[slot]} onChange={(value) => setEdit({ ...edit, gallery: edit.gallery.map((row: string, index: number) => index === slot ? value : row) })} />)}
              <VideoField value={edit.video} onChange={(video) => setEdit({ ...edit, video })} />
            </div>
          </details>
          <details className="min-w-0 rounded-2xl border border-line p-3">
            <summary className="cursor-pointer text-sm font-medium">Social media</summary>
            <p className="mt-2 text-xs text-muted">Your reel appears on your public profile above Promotions. Your social links appear at the bottom. Use a full https link from Instagram, TikTok or YouTube.</p>
            <div className="mt-3 grid gap-2">
              <label className="grid min-w-0 gap-1 text-sm">Reel link<input className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line px-3" value={edit.reel} onChange={(event) => setEdit({ ...edit, reel: event.target.value })} placeholder="https://" /></label>
              {(["instagram", "facebook", "tiktok", "x"] as const).map((field) => (
                <label key={field} className="grid min-w-0 gap-1 text-sm capitalize">{field}<input className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line px-3" value={edit.social[field] || ""} onChange={(event) => setEdit({ ...edit, social: { ...edit.social, [field]: event.target.value } })} placeholder="https://" /></label>
              ))}
            </div>
          </details>
          <details className="min-w-0 rounded-2xl border border-line p-3">
            <summary className="cursor-pointer text-sm font-medium">Opening hours</summary>
            <p className="mt-2 text-xs text-muted">Hours go live when you save. Empty hours are hidden on the public page.</p>
            <div className="mt-3 grid gap-2"><HoursEditor value={edit.hours} onChange={(hours) => setEdit({ ...edit, hours })} /><SpecialHours rows={edit.specialHours} onChange={(specialHours) => setEdit({ ...edit, specialHours })} /></div>
          </details>
          <details className="min-w-0 rounded-2xl border border-line p-3">
            <summary className="cursor-pointer text-sm font-medium">Address and contact</summary>
            <div className="mt-3 grid gap-2">
              <input className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line px-3" placeholder="Number" value={edit.address.split(",")[0] || ""} onChange={(event) => setEdit({ ...edit, address: [event.target.value, ...edit.address.split(",").slice(1)].join(", ") })} />
              <input className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line px-3" placeholder="Street name" value={edit.address.split(",")[1]?.trim() || ""} onChange={(event) => { const parts = edit.address.split(","); parts[1] = event.target.value; setEdit({ ...edit, address: parts.join(", ") }); }} />
              <input className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line px-3" placeholder="Town or city" value={edit.address.split(",")[2]?.trim() || ""} onChange={(event) => { const parts = edit.address.split(","); parts[2] = event.target.value; setEdit({ ...edit, address: parts.join(", ") }); }} />
              <input className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line px-3" placeholder="County" value={edit.address.split(",")[3]?.trim() || ""} onChange={(event) => { const parts = edit.address.split(","); parts[3] = event.target.value; setEdit({ ...edit, address: parts.join(", ") }); }} />
              <input className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line px-3" placeholder="Postcode" value={edit.postcode} onChange={(event) => setEdit({ ...edit, postcode: event.target.value.toUpperCase() })} />
              <p className="text-xs text-muted">{edit.postcode ? (area ? `Neighbourhood: ${area.discoveryName}` : "Outside Lambeth. This postcode will not be saved.") : "A Lambeth postcode places the business in its neighbourhood."}</p>
              <input className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line px-3" placeholder="Telephone" value={edit.phone} onChange={(event) => setEdit({ ...edit, phone: event.target.value })} />
              <input className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line px-3" placeholder="Email address" value={edit.email} onChange={(event) => setEdit({ ...edit, email: event.target.value })} />
              <input className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line px-3" placeholder="Website" value={edit.website || ""} onChange={(event) => setEdit({ ...edit, website: event.target.value })} />
            </div>
          </details>
          <details className="min-w-0 rounded-2xl border border-line p-3">
            <summary className="cursor-pointer text-sm font-medium">Chat and bookings</summary>
            <div className="mt-3 grid gap-2">
              <label className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-line px-3 py-2 text-sm">
                <span>Book a table</span>
                <span className="toggle">
                  <input type="checkbox" checked={edit.bookingOn} onChange={(event) => { const bookingOn = event.target.checked; const next = { ...edit, bookingOn }; setEdit(next); onSave({ ...next, bookings: bookingOn, appointments: edit.appointmentOn, chatOn: edit.chatOn }); }} />
                  <span />
                </span>
              </label>
              <label className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-line px-3 py-2 text-sm">
                <span>Book an appointment</span>
                <span className="toggle">
                  <input type="checkbox" checked={edit.appointmentOn} onChange={(event) => { const appointmentOn = event.target.checked; const next = { ...edit, appointmentOn }; setEdit(next); onSave({ ...next, bookings: edit.bookingOn, appointments: appointmentOn, chatOn: edit.chatOn }); }} />
                  <span />
                </span>
              </label>
              <label className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-line px-3 py-2 text-sm">
                <span>Allow customer chat</span>
                <span className="toggle">
                  <input type="checkbox" checked={edit.chatOn} onChange={(event) => { const chatOn = event.target.checked; const next = { ...edit, chatOn }; setEdit(next); onSave({ ...next, bookings: edit.bookingOn, appointments: edit.appointmentOn, chatOn }); }} />
                  <span />
                </span>
              </label>
              <Link to="/inbox" className="text-sm font-medium text-primary">Business chat inbox</Link>
            </div>
          </details>
          </> : null}
          {section === "offers" ? <><h3 id="offers" className="font-serif text-xl text-deep">Content and offers</h3><details className="min-w-0 rounded-2xl border border-line p-3">
            <summary className="cursor-pointer text-sm font-medium">Promotions</summary>
            <div className="mt-3"><Promotions offers={offers} onOffer={onOffer} onDelete={onDeleteOffer} /></div>
          </details>
          <details className="min-w-0 rounded-2xl border border-line p-3">
            <summary className="cursor-pointer text-sm font-medium">Menu items</summary>
          <div className="mt-3 grid w-full min-w-0 max-w-full gap-3 overflow-hidden">
            <div className="grid min-w-0 gap-2">
              <p className="text-sm font-medium">Sections</p>
              {sections.map((name) => (
                <div key={name} className="grid gap-2 rounded-xl border border-line p-2">
                  <input className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line px-3" value={name} onChange={(event) => { const next = event.target.value; setSections(sections.map((row) => row === name ? next : row)); setMenu(menu.map((row: { service: string }) => row.service === name ? { ...row, service: next } : row)); }} />
                  <button type="button" className="w-fit text-sm font-medium text-warn" onClick={() => { setSections(sections.filter((row) => row !== name)); setMenu(menu.filter((row: { service: string }) => row.service !== name)); }}>Delete</button>
                </div>
              ))}
              <input className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line px-3" value={sectionName} onChange={(event) => setSectionName(event.target.value)} placeholder="New section" />
              <button type="button" className="w-fit text-sm font-medium text-primary" onClick={() => { if (!sectionName.trim()) return; setSections([...sections, sectionName.trim()]); setSectionName(""); }}>Add section</button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Items</p>
              <button type="button" className="rounded-full border border-line px-3 py-1 text-xs font-medium" onClick={() => setMenu([...menu, { name: "", price: "", detail: "", service: sections[0] || "General" }])}>Add</button>
            </div>
            {menu.map((item: { name: string; price: string; detail: string; service: string }, index: number) => (
              <MenuItem key={index} item={item} sections={sections} onChange={(next) => setMenu(menu.map((row: typeof item, i: number) => i === index ? next : row))} onDelete={() => setMenu(menu.filter((_: typeof item, i: number) => i !== index))} />
            ))}
          </div>
          </details></> : null}
          <button type="submit" className="min-h-11 w-fit rounded-full bg-primary px-4 text-sm font-medium text-on-primary">Submit for approval</button>
          {saved ? <p className="text-sm text-muted">{saved}</p> : null}
        </form>
        </Card> : null}
      {section === "events" ? <BusinessEvents businessId={business.id} events={events} onDelete={onDeleteEvent} /> : null}
      {section === "listings" ? <Card>
        <div className="mb-3"><h2 className="text-lg">Listings</h2></div>
        <p className="text-sm text-muted">Listings wait for approval before they go live. Tap a name to open it.</p>
        <div className="mt-3 grid gap-3">
        {listings.map((row: any) => (
          <article key={row.id} className="rounded-2xl border border-line p-3">
            <div className="flex items-start justify-between gap-2">
              <Link to="/listing/$id" params={{ id: row.id }} search={{ from: "" }} className="font-medium">{row.title}</Link>
              <span className="rounded-full bg-band px-2 py-1 text-xs">{row.status === "published" ? "Live" : "Pending approval"}</span>
            </div>
            <p className="mt-1 text-sm text-muted">{row.priceLabel || "No price"}</p>
            <div className="mt-2 flex gap-2 text-sm">
              <Link to="/inbox" className="text-primary">Messages</Link>
              <button type="button" className="text-warn" onClick={() => onDeleteListing(row.id)}>Remove</button>
            </div>
          </article>
        ))}
        {listings.length === 0 ? <p className="text-sm text-muted">No listings yet.</p> : null}
        <Link to="/market" search={{ business: business.id, mine: "", create: "1", keep: "" }} className="min-h-11 w-fit rounded-full bg-primary px-4 text-sm font-medium text-on-primary">Create a listing</Link>
        </div>
      </Card> : null}
      {section === "team" ? <><h3 id="team" className="font-serif text-xl text-deep">Team and settings</h3><Link to="/settings" className="text-sm font-medium text-primary">Dark mode and notifications</Link><StaffBox business={business} events={events} directory={directory} setMember={setMember} removeMember={removeMember} /><details className="rounded-2xl border border-line bg-white p-4">
        <summary className="cursor-pointer text-lg font-medium">Your ratings</summary>
        <p className="mt-2 text-sm">Average {average} from {ratings.length} ratings</p>
        <div className="mt-2 grid gap-2">{[...ratings].sort((a, b) => String(b.at || "").localeCompare(String(a.at || ""))).map((row) => <p key={row.id} className="text-sm">{row.stars} stars · {row.at ? String(row.at).slice(0, 10) : "No date"} · {row.from || "A neighbour"}</p>)}{comments.map((row: { id: string; from: string; body: string }) => <p key={row.id} className="text-sm text-muted">{row.from}: {row.body}</p>)}</div>
      </details>
      <details className="rounded-2xl border border-line bg-white p-4">
        <summary className="cursor-pointer text-lg font-medium">Events</summary>
        <p className="mt-2 text-sm text-muted">Current events, past events and new events are on the Events card.</p>
        <Link to="/owner" search={{ section: "events" }} className="mt-2 inline-block text-sm font-medium text-primary">Open events</Link>
      </details>
      <details className="min-w-0 rounded-2xl border border-line bg-white p-4">
        <summary className="cursor-pointer text-lg font-medium">Listings</summary>
        {listings.map((row: { id: string; title: string; status: string; priceLabel?: string }) => <div key={row.id} className="mt-2 flex items-center justify-between gap-2 text-sm"><p>{row.title} · {row.priceLabel || "No price"} · {row.status.replaceAll("_", " ")}</p><button type="button" className="text-sm font-medium text-warn" onClick={() => onDeleteListing(row.id)}>Delete</button></div>)}
        <Link to="/market" search={{ business: business.id, mine: "1", create: "1", keep: "" }} className="mt-3 inline-block text-sm font-medium text-primary">Create a listing</Link>
      </details></> : null}
    </>
  );
}

function eventDay(row: { date?: string; when?: string }) {
  const match = `${row.date || ""} ${row.when || ""}`.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : "";
}

function eventLabel(status: string) {
  if (status === "published") return "Published";
  if (status === "refused") return "Declined";
  if (status === "suspended") return "Cancelled";
  if (status === "changes_requested") return "Changes requested";
  return "Pending approval";
}

const EVENT_DUTIES = ["Door access", "Event management", "Event security", "First aid", "Entertainment"];

function BusinessEvents({ businessId, events, onDelete }: { businessId: string; events: any[]; onDelete: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const matched = events.filter((row) => !needle || row.title.toLowerCase().includes(needle));
  const today = new Date().toISOString().slice(0, 10);
  const current = matched.filter((row) => { const day = eventDay(row); return !day || day >= today; });
  const past = matched.filter((row) => { const day = eventDay(row); return day && day < today; });
  return (
    <Card>
      <div className="mb-3">
        <h2 className="font-serif text-2xl text-deep">Events</h2>
      </div>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events" className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line bg-bg px-3" />
      <div className="mt-3 grid gap-3">
        <details className="rounded-2xl border border-line p-3">
          <summary className="cursor-pointer text-sm font-medium">Current events · {current.length}</summary>
          <div className="mt-3 grid gap-2">
            {current.map((row) => <EventManage key={row.id} event={row} onDelete={onDelete} />)}
            {current.length === 0 ? <p className="text-sm text-muted">No current events.</p> : null}
          </div>
        </details>
        <details className="rounded-2xl border border-line p-3">
          <summary className="cursor-pointer text-sm font-medium">Past events · {past.length}</summary>
          <div className="mt-3 grid gap-2 opacity-70">
            {past.map((row) => <EventManage key={row.id} event={row} onDelete={onDelete} past />)}
            {past.length === 0 ? <p className="text-sm text-muted">No past events.</p> : null}
          </div>
        </details>
        <details className="rounded-2xl border border-line p-3">
          <summary className="cursor-pointer text-sm font-medium">New event</summary>
          <p className="mt-2 text-sm text-muted">A new event is sent for approval. It cannot go on sale until it is published.</p>
          <div className="mt-3"><Suspense fallback={<p className="text-sm text-muted">Loading the form…</p>}><EventForm businessId={businessId} /></Suspense></div>
        </details>
      </div>
    </Card>
  );
}

function EventManage({ event, onDelete, past = false }: { event: any; onDelete: (id: string) => void; past?: boolean }) {
  const reservations = useCommon((state) => state.reservations).filter((row) => row.eventId === event.id);
  const messages = useCommon((state) => state.enquiries).filter((row) => row.eventId === event.id);
  const scan = useCommon((state) => state.scan);
  const replyEnquiry = useCommon((state) => state.replyEnquiry);
  const setMember = useCommon((state) => state.setMember);
  const removeMember = useCommon((state) => state.removeMember);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [email, setEmail] = useState("");
  const [duty, setDuty] = useState(EVENT_DUTIES[0]);
  const [staffNote, setStaffNote] = useState("");
  const [reply, setReply] = useState("");
  const [openId, setOpenId] = useState("");
  const capacity = event.capacity > 0 ? event.capacity : 40;
  const sold = reservations.length;
  const checked = reservations.filter((row) => row.scannedAt).length;
  function exportList() {
    const lines = ["Name,Status", ...reservations.map((row) => `${row.accountName},${row.scannedAt ? "Checked in" : "Valid"}`)];
    const file = new Blob([lines.join("\n")], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = `${event.title}-attendees.csv`;
    link.click();
  }
  return (
    <details className="min-w-0 rounded-2xl border border-line bg-white p-3">
      <summary className="cursor-pointer text-sm font-medium">
        <img src={event.image || pictureFor(`${event.title} ${event.kind} ${event.detail || ""}`, "event")} alt="" className="mr-2 inline-block h-10 w-10 rounded-lg object-cover align-middle" />
        <span className="align-middle">{event.title}</span>
        <span className="ml-2 inline-block rounded-full bg-band px-2 py-1 align-middle text-xs font-medium">{eventLabel(event.status)}</span>
      </summary>
      <p className="mt-2 text-sm text-muted">{event.when}{event.place ? ` · ${event.place}` : ""}</p>
      {event.reason ? <p className="mt-1 text-sm text-muted">{event.reason}</p> : null}
      <div className="mt-3 grid min-w-0 gap-2">
        <details className="rounded-2xl border border-line p-3">
          <summary className="cursor-pointer text-sm font-medium">Ticket sales</summary>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-muted">
            <p className="rounded-2xl bg-band p-2"><span className="block font-serif text-2xl text-deep">{capacity}</span>Capacity</p>
            <p className="rounded-2xl bg-band p-2"><span className="block font-serif text-2xl text-deep">{sold}</span>Sold</p>
            <p className="rounded-2xl bg-band p-2"><span className="block font-serif text-2xl text-deep">{Math.max(capacity - sold, 0)}</span>Remaining</p>
          </div>
          <p className="mt-2 text-sm text-muted">{event.tickets ? "Ticket sales are on." : "Ticket sales are off."} A 10% fee applies to paid tickets. Fees are not billed in this preview.</p>
        </details>
        <details className="rounded-2xl border border-line p-3">
          <summary className="cursor-pointer text-sm font-medium">Attendees · {sold}</summary>
          <p className="mt-2 text-sm text-muted">{checked} checked in · {sold - checked} still to arrive</p>
          <div className="mt-2 grid gap-1">
            {reservations.map((row) => <p key={row.id} className="text-sm">{row.accountName} <span className="text-muted">· {row.scannedAt ? "Checked in" : "Valid"}</span></p>)}
            {reservations.length === 0 ? <p className="text-sm text-muted">No RSVPs or tickets yet.</p> : null}
          </div>
          <button type="button" className="mt-3 min-h-11 rounded-full border border-line px-4 text-sm font-medium" onClick={exportList}>Export CSV</button>
        </details>
        <details className="rounded-2xl border border-line p-3">
          <summary className="cursor-pointer text-sm font-medium">Event staff</summary>
          <div className="mt-3 grid min-w-0 gap-2">
            {(event.staff ?? []).map((person: { email: string; name: string; duty?: string }) => (
              <div key={person.email} className="flex min-w-0 items-center justify-between gap-2 rounded-2xl border border-line px-3 py-2 text-sm">
                <span className="min-w-0 truncate">{person.name} · {person.duty || "Staff"}</span>
                <button type="button" className="shrink-0 text-sm font-medium text-warn" onClick={() => setStaffNote(removeMember("event", event.id, person.email))}>Remove</button>
              </div>
            ))}
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Staff email" className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line bg-bg px-3" />
            <select value={duty} onChange={(event) => setDuty(event.target.value)} className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line bg-bg px-3">{EVENT_DUTIES.map((name) => <option key={name}>{name}</option>)}</select>
            <button type="button" className="min-h-11 w-fit rounded-full bg-primary px-4 text-sm font-medium text-on-primary" onClick={() => setStaffNote(setMember("event", event.id, email, "staff", duty))}>Add staff</button>
            {staffNote ? <p className="text-sm text-muted">{staffNote}</p> : null}
          </div>
        </details>
        {past ? null : <details className="rounded-2xl border border-line p-3">
          <summary className="cursor-pointer text-sm font-medium">Ticket scanning · {checked} entered</summary>
          <form className="mt-3 flex min-w-0 gap-2" onSubmit={(submit) => { submit.preventDefault(); const next = scan(code, event.id); setResult(next.ok ? { ok: true, text: next.name } : { ok: false, text: next.reason }); setCode(""); }}>
            <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Ticket code" className="box-border min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-bg px-3" />
            <button type="submit" className="min-h-11 shrink-0 rounded-full bg-primary px-4 text-sm font-medium text-on-primary">Scan</button>
          </form>
        </details>}
        <details className="rounded-2xl border border-line p-3">
          <summary className="cursor-pointer text-sm font-medium">Event messages · {messages.filter((row) => !row.read).length} unread</summary>
          <div className="mt-3 grid min-w-0 gap-2">
            {messages.map((row) => (
              <div key={row.id} className="min-w-0 rounded-2xl border border-line p-3 text-sm">
                <p className="font-medium">{row.from}{row.read ? "" : " · Unread"}</p>
                <p className="text-muted">{row.body}</p>
                {row.reply ? <p className="mt-1">Reply: {row.reply}</p> : null}
                <button type="button" className="mt-1 text-sm font-medium text-primary" onClick={() => setOpenId(openId === row.id ? "" : row.id)}>Reply</button>
                {openId === row.id ? <form className="mt-2 flex min-w-0 gap-2" onSubmit={(submit) => { submit.preventDefault(); if (!reply.trim()) return; replyEnquiry(row.id, reply.trim()); setReply(""); setOpenId(""); }}>
                  <input value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Reply" className="box-border min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-bg px-3" />
                  <button type="submit" className="min-h-11 shrink-0 rounded-full bg-primary px-4 text-sm font-medium text-on-primary">Send</button>
                </form> : null}
              </div>
            ))}
            {messages.length === 0 ? <p className="text-sm text-muted">No messages for this event.</p> : null}
          </div>
        </details>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link to="/event/$id" params={{ id: event.id }} search={{ from: "" }} className="font-medium text-primary">Public page</Link>
          <button type="button" className="font-medium text-warn" onClick={() => onDelete(event.id)}>Remove</button>
        </div>
      </div>
      {result ? <button type="button" className={`fixed inset-0 z-50 grid place-items-center p-8 ${result.ok ? "scan-enter" : "scan-decline"}`} onClick={() => setResult(null)}>
        <span className="max-w-sm text-center">
          <span className="block font-serif text-6xl tracking-tight">{result.ok ? "ENTER" : "DECLINED"}</span>
          <span className="mt-3 block text-lg">{result.text}</span>
          <span className="mt-6 block text-sm opacity-80">{checked + (result.ok ? 1 : 0)} entered · Tap to close</span>
        </span>
      </button> : null}
    </details>
  );
}

function SpecialHours({ rows, onChange }: { rows: { label: string; from: string; to: string; opens: string; closes: string; closed?: boolean }[]; onChange: (rows: { label: string; from: string; to: string; opens: string; closes: string; closed?: boolean }[]) => void }) {
  const [editing, setEditing] = useState(-1);
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between"><p className="text-sm font-medium">Special opening times</p><button type="button" className="text-sm font-medium text-primary" onClick={() => onChange([...rows, { label: "Special hours", from: "", to: "", opens: "09:00", closes: "17:00" }])}>Add</button></div>
      {rows.map((row, index) => (
        <div key={index} className="rounded-xl border border-line p-2">
          <div className="flex items-center justify-between gap-2 text-sm"><span className="truncate">{row.label || "Special hours"} · {row.from || "date"}</span><span className="flex gap-2"><button type="button" className="text-primary" onClick={() => setEditing(editing === index ? -1 : index)}>Edit</button><button type="button" className="text-warn" onClick={() => onChange(rows.filter((_, i) => i !== index))}>Delete</button></span></div>
          {editing === index ? <div className="mt-2 grid grid-cols-2 gap-2">
            <input className="col-span-2 min-h-10 rounded-lg border border-line px-2" value={row.label} onChange={(event) => onChange(rows.map((item, i) => i === index ? { ...item, label: event.target.value } : item))} placeholder="Label" />
            <label className="grid gap-1 text-xs">Date from<input type="date" className="min-h-10 rounded-lg border border-line px-2" value={row.from} onChange={(event) => onChange(rows.map((item, i) => i === index ? { ...item, from: event.target.value } : item))} /></label>
            <label className="grid gap-1 text-xs">Date to<input type="date" className="min-h-10 rounded-lg border border-line px-2" value={row.to} onChange={(event) => onChange(rows.map((item, i) => i === index ? { ...item, to: event.target.value } : item))} /></label>
            <label className="grid gap-1 text-xs">Opens<input type="time" className="min-h-10 rounded-lg border border-line px-2" value={row.opens} onChange={(event) => onChange(rows.map((item, i) => i === index ? { ...item, opens: event.target.value } : item))} /></label>
            <label className="grid gap-1 text-xs">Closes<input type="time" className="min-h-10 rounded-lg border border-line px-2" value={row.closes} onChange={(event) => onChange(rows.map((item, i) => i === index ? { ...item, closes: event.target.value } : item))} /></label>
            <button type="button" className="col-span-2 w-fit text-sm font-medium text-primary" onClick={() => setEditing(-1)}>Submit for approval</button>
          </div> : <p className="text-xs text-muted">{row.from || "Date"} to {row.to || "date"} · {row.opens}–{row.closes}</p>}
        </div>
      ))}
    </div>
  );
}

function HoursEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [editing, setEditing] = useState(false);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const ranges = days.map((day) => {
    const found = value.split(",").map((part) => part.trim()).find((part) => part.startsWith(day));
    const times = found?.split(" ")[1]?.split("–") ?? [];
    return { day, on: Boolean(found), open: times[0] || "09:00", close: times[1] || "17:00" };
  });
  function write(next: typeof ranges) {
    onChange(next.filter((row) => row.on).map((row) => `${row.day} ${row.open}–${row.close}`).join(", "));
  }
  return (
    <div>
      <div className="flex items-center justify-between"><p className="text-sm">{value || "No hours set"}</p><button type="button" className="text-sm font-medium text-primary" onClick={() => setEditing((open) => !open)}>{editing ? "Close" : "Edit"}</button></div>
      {editing ? <div className="mt-2 grid gap-1">{ranges.map((row, index) => (
        <label key={row.day} className="grid grid-cols-[3rem_auto_1fr_1fr] items-center gap-2 text-sm">
          <span>{row.day}</span>
          <input type="checkbox" checked={row.on} onChange={(event) => write(ranges.map((item, i) => i === index ? { ...item, on: event.target.checked } : item))} />
          <input type="time" value={row.open} onChange={(event) => write(ranges.map((item, i) => i === index ? { ...item, open: event.target.value, on: true } : item))} className="min-h-10 rounded-lg border border-line px-2" />
          <input type="time" value={row.close} onChange={(event) => write(ranges.map((item, i) => i === index ? { ...item, close: event.target.value, on: true } : item))} className="min-h-10 rounded-lg border border-line px-2" />
        </label>
      ))}</div> : null}
    </div>
  );
}

function VideoField({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  const [note, setNote] = useState("");
  return (
    <label className="grid min-w-0 gap-1 text-sm">Short video, five seconds
      <input type="file" accept="video/*" className="text-sm" onChange={(event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setNote("Reading the video…");
        const reader = new FileReader();
        reader.onprogress = (progress) => { if (progress.lengthComputable) setNote(`Uploading ${Math.round((progress.loaded / progress.total) * 100)}%`); };
        reader.onload = () => { onChange(String(reader.result || "")); setNote("Video ready. Save to put it on the page."); };
        reader.onerror = () => setNote("That video could not be read. Try a shorter one.");
        reader.readAsDataURL(file);
      }} />
      {note ? <p className="text-xs text-muted">{note}</p> : value ? <p className="text-xs text-muted">Video added.</p> : null}
    </label>
  );
}

function ImageField({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  const [note, setNote] = useState("");
  return (
    <label className="grid gap-2 rounded-2xl border border-line bg-white p-3 text-sm">
      <span className="font-medium">{label}</span>
      {value ? <img src={value} alt="" className="h-28 w-full rounded-xl object-cover" /> : <span className="grid h-20 place-items-center rounded-xl bg-band text-xs text-muted">No picture yet</span>}
      <input type="file" accept="image/*" className="text-xs" onChange={(event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setNote("Reading the picture…");
        const reader = new FileReader();
        reader.onprogress = (progress) => {
          if (progress.lengthComputable) setNote(`Uploading ${Math.round((progress.loaded / progress.total) * 100)}%`);
        };
        reader.onload = () => {
          onChange(String(reader.result || ""));
          setNote("Picture ready. Save to put it on the page.");
        };
        reader.onerror = () => setNote("That picture could not be read. Try another.");
        reader.readAsDataURL(file);
      }} />
      {note ? <p className="text-xs text-muted">{note}</p> : null}
    </label>
  );
}

function Promotions({ offers, onOffer, onDelete }: { offers: { id: string; title: string; detail: string; price?: string; image?: string; upload?: string }[]; onOffer: (input: { id?: string; title: string; detail: string; price?: string; image?: string }) => void; onDelete: (id: string) => void }) {
  const [draft, setDraft] = useState({ title: "", detail: "", price: "", image: "" });
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState("");
  const current = offers[0];
  const older = offers.slice(1);
  return (
    <div className="grid min-w-0 gap-2 overflow-hidden">
      {current ? <div className="min-w-0 overflow-hidden rounded-xl border border-line p-2">
        <p className="text-xs text-muted">Current promotion</p>
        <div className="mt-1 flex min-w-0 items-center gap-2">
          {current.upload || current.image || pictureFor(current.title, "business") ? <img src={current.upload || current.image || pictureFor(`${current.title} ${current.detail}`, "business")} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" /> : null}
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{current.title}</p><p className="truncate text-xs text-muted">{current.price}</p></div>
          <button type="button" className="text-xs font-medium text-primary" onClick={() => setEditing(editing === current.id ? "" : current.id)}>Edit</button>
          <button type="button" className="text-xs font-medium text-warn" onClick={() => onDelete(current.id)}>Delete</button>
        </div>
        {editing === current.id ? <div className="mt-2"><PromoEdit offer={current} onOffer={(input) => { onOffer(input); setEditing(""); }} /></div> : null}
      </div> : <p className="text-sm text-muted">No current promotion.</p>}
      {older.map((offer) => (
        <div key={offer.id} className="flex min-w-0 items-center gap-2 overflow-hidden rounded-xl border border-line p-2 text-sm">
          <img src={offer.upload || offer.image || pictureFor(`${offer.title} ${offer.detail}`, "business")} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
          <span className="min-w-0 flex-1 truncate">{offer.title} · {offer.price}</span>
          <button type="button" className="text-xs font-medium text-primary" onClick={() => setEditing(editing === offer.id ? "" : offer.id)}>Edit</button>
          <button type="button" className="text-xs font-medium text-warn" onClick={() => onDelete(offer.id)}>Delete</button>
        </div>
      ))}
      {adding ? <div className="grid min-w-0 gap-2">
        <input placeholder="Promotion title" className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line px-3" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
        <input placeholder="Detail" className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line px-3" value={draft.detail} onChange={(event) => setDraft({ ...draft, detail: event.target.value })} />
        <input placeholder="Price" className="box-border min-h-11 w-full min-w-0 rounded-xl border border-line px-3" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} />
        <button type="button" className="w-fit text-sm font-medium text-primary" onClick={() => { if (!draft.title) return; onOffer(draft); setDraft({ title: "", detail: "", price: "", image: "" }); setAdding(false); }}>Submit for approval</button>
      </div> : <button type="button" className="w-fit text-sm font-medium text-primary" onClick={() => setAdding(true)}>Add new promotion</button>}
    </div>
  );
}

function PromoEdit({ offer, onOffer }: { offer: { id: string; title: string; detail: string; price?: string; image?: string; upload?: string }; onOffer: (input: { id?: string; title: string; detail: string; price?: string; image?: string }) => void }) {
  const [edit, setEdit] = useState({ id: offer.id, title: offer.title, detail: offer.detail, price: offer.price || "", image: offer.upload || offer.image || "" });
  return (
    <div className="grid gap-2 rounded-xl bg-band p-3">
      <input className="min-h-11 rounded-xl border border-line px-3" value={edit.title} onChange={(event) => setEdit({ ...edit, title: event.target.value })} />
      <input className="min-h-11 rounded-xl border border-line px-3" value={edit.price} onChange={(event) => setEdit({ ...edit, price: event.target.value })} />
      <ImageField label="Image" value={edit.image} onChange={(image) => setEdit({ ...edit, image })} />
      <button type="button" className="text-sm font-medium text-primary" onClick={() => onOffer(edit)}>Save promotion</button>
    </div>
  );
}

function EventEdit({ event, onSave }: { event: any; onSave: (input: any) => void }) {
  const [open, setOpen] = useState(false);
  const [sell, setSell] = useState(Boolean(event.tickets));
  const [edit, setEdit] = useState({ title: event.title, when: event.when, kind: event.kind, place: event.place || "", detail: event.detail || "", image: event.image || "", tickets: event.tickets || "", capacity: event.capacity || 0, phone: event.phone || "", email: event.email || "", website: event.website || "" });
  return (
    <div className="rounded-xl border border-line p-3 text-sm">
      <p className="font-medium">{event.title}</p>
      <p className="text-muted">{event.when} · {event.status.replaceAll("_", " ")}</p>
      <button type="button" className="mt-2 font-medium text-primary" onClick={() => setOpen((value) => !value)}>{open ? "Close" : "Edit"}</button>
      {open ? (
        <form className="mt-2 grid gap-2" onSubmit={(submit) => { submit.preventDefault(); onSave({ ...edit, tickets: sell ? edit.tickets : "", capacity: Number(edit.capacity) || 0 }); setOpen(false); }}>
          <input className="min-h-11 rounded-xl border border-line px-3" value={edit.title} onChange={(input) => setEdit({ ...edit, title: input.target.value })} />
          <label className="grid gap-1">Date<input type="date" className="min-h-11 rounded-xl border border-line px-3" value={edit.when.slice(0, 10)} onChange={(input) => setEdit({ ...edit, when: `${input.target.value} ${edit.when.slice(11, 16)}`.trim() })} /></label><label className="grid gap-1">Time<input type="time" className="min-h-11 rounded-xl border border-line px-3" value={edit.when.slice(11, 16)} onChange={(input) => setEdit({ ...edit, when: `${edit.when.slice(0, 10)} ${input.target.value}`.trim() })} /></label>
          <select className="min-h-11 rounded-xl border border-line px-3" value={edit.kind} onChange={(input) => setEdit({ ...edit, kind: input.target.value as EventKind })}>{EVENT_KINDS.map((kind) => <option key={kind}>{kind}</option>)}</select>
          <ImageField label="Event image" value={edit.image || pictureFor(`${edit.title} ${edit.kind} ${edit.detail}`, "event")} onChange={(image) => setEdit({ ...edit, image })} />
          <label className="flex items-center gap-2"><input type="checkbox" checked={sell} onChange={(input) => setSell(input.target.checked)} />Allow ticket sales</label>
          {sell ? <input placeholder="Ticket website" className="min-h-11 rounded-xl border border-line px-3" value={edit.tickets} onChange={(input) => setEdit({ ...edit, tickets: input.target.value })} /> : null}
          <label className="grid gap-1">Capacity<input type="number" min="0" className="min-h-11 rounded-xl border border-line px-3" value={edit.capacity} onChange={(input) => setEdit({ ...edit, capacity: Number(input.target.value) })} /></label>
          <input placeholder="Telephone" className="min-h-11 rounded-xl border border-line px-3" value={edit.phone} onChange={(input) => setEdit({ ...edit, phone: input.target.value })} />
          <input placeholder="Email address" className="min-h-11 rounded-xl border border-line px-3" value={edit.email} onChange={(input) => setEdit({ ...edit, email: input.target.value })} />
          <input placeholder="Event website" className="min-h-11 rounded-xl border border-line px-3" value={edit.website} onChange={(input) => setEdit({ ...edit, website: input.target.value })} />
          <input placeholder="Shop number" className="min-h-11 rounded-xl border border-line px-3" value={edit.place.split(",")[0] || ""} onChange={(input) => setEdit({ ...edit, place: [input.target.value, ...edit.place.split(",").slice(1)].join(", ") })} />
          <input placeholder="Street name" className="min-h-11 rounded-xl border border-line px-3" value={edit.place.split(",")[1]?.trim() || ""} onChange={(input) => { const parts = edit.place.split(","); parts[1] = input.target.value; setEdit({ ...edit, place: parts.join(", ") }); }} />
          <input placeholder="Town" className="min-h-11 rounded-xl border border-line px-3" value={edit.place.split(",")[2]?.trim() || ""} onChange={(input) => { const parts = edit.place.split(","); parts[2] = input.target.value; setEdit({ ...edit, place: parts.join(", ") }); }} />
          <input placeholder="City" className="min-h-11 rounded-xl border border-line px-3" value={edit.place.split(",")[3]?.trim() || ""} onChange={(input) => { const parts = edit.place.split(","); parts[3] = input.target.value; setEdit({ ...edit, place: parts.join(", ") }); }} />
          <input placeholder="Postal code" className="min-h-11 rounded-xl border border-line px-3" value={edit.place.split(",")[4]?.trim() || ""} onChange={(input) => { const parts = edit.place.split(","); parts[4] = input.target.value; setEdit({ ...edit, place: parts.join(", ") }); }} />
          <button type="submit" className="min-h-11 rounded-full bg-primary px-4 text-sm font-medium text-white">Save event</button>
        </form>
      ) : null}
    </div>
  );
}

function StaffBox({ business, events, directory, setMember, removeMember }: any) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"" | "qr" | "uid">("");
  const [note, setNote] = useState("");
  const [role, setRole] = useState("staff");
  const videoRef = { current: null as HTMLVideoElement | null };
  function addByCode(code: string) {
    const person = directory.find((row: { id?: string; email?: string; name: string }) => row.id === code.trim() || String(row.email || "").slice(0, 8).toUpperCase() === code.trim().toUpperCase());
    setNote(person ? setMember("business", business.id, person.email, role) : "No member uses that code.");
  }
  async function scan() {
    const Detector = (window as unknown as { BarcodeDetector?: new (opts: { formats: string[] }) => { detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
    const video = videoRef.current;
    if (!Detector || !video) { setNote("This phone cannot scan. Use the UID code."); return; }
    const found = await new Detector({ formats: ["qr_code"] }).detect(video);
    const code = found[0]?.rawValue || "";
    if (!code) { setNote("No code in view. Hold the QR steady."); return; }
    setQuery(code);
    addByCode(code);
  }
  return (
    <details className="min-w-0 rounded-2xl border border-line p-3">
      <summary className="cursor-pointer text-sm font-medium">Owners and staff</summary>
      <div className="mt-3 grid gap-2">
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-full border border-line px-3 py-2 text-sm" onClick={async () => { setMode("qr"); const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }); if (videoRef.current) videoRef.current.srcObject = stream; }}>Add staff by QR code</button>
          <button type="button" className="rounded-full border border-line px-3 py-2 text-sm" onClick={() => setMode("uid")}>Add staff by UID code</button>
        </div>
        {mode === "qr" ? <div className="grid gap-2"><video ref={(node) => { videoRef.current = node; }} autoPlay playsInline className="h-40 w-full rounded-xl bg-black object-cover" /><button type="button" className="w-fit text-sm font-medium text-primary" onClick={() => void scan()}>Capture code</button></div> : null}
        {mode === "uid" ? <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); addByCode(query); }}><input className="min-h-11 min-w-0 flex-1 rounded-xl border border-line px-3" value={query} onChange={(event) => setQuery(event.target.value.toUpperCase())} placeholder="UID code" /><button className="text-sm font-medium text-primary">Add</button></form> : null}
        <p className="text-sm font-medium">Staff</p>
        {(business.staff ?? []).length === 0 ? <p className="text-sm text-muted">No staff yet.</p> : (business.staff ?? []).map((person: { email: string; name: string; role: string }) => <div key={person.email} className="flex items-center justify-between text-sm"><span>{person.name} · {person.role}</span><button type="button" className="text-warn" onClick={() => setNote(removeMember("business", business.id, person.email))}>Remove</button></div>)}
        {note ? <p className="text-sm text-muted">{note}</p> : null}
      </div>
    </details>
  );
}

function MenuItem({ item, sections, onChange, onDelete }: { item: { name: string; price: string; detail: string; service: string }; sections: string[]; onChange: (item: { name: string; price: string; detail: string; service: string }) => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="grid gap-2 overflow-hidden rounded-xl border border-line p-3">
      <p className="break-words text-sm font-medium">{item.name || "New item"}</p>
      <p className="text-sm text-muted">{item.price || "No price"} · {item.service || "No section"}</p>
      <div className="flex gap-2">
        <button type="button" className="min-h-11 rounded-full border border-line px-4 text-sm" onClick={() => setOpen((value) => !value)}>Edit</button>
        <button type="button" className="min-h-11 rounded-full border border-line px-4 text-sm text-warn" onClick={onDelete}>Delete</button>
      </div>
      {open ? <div className="grid gap-2">
        <select className="box-border min-h-11 w-full rounded-xl border border-line px-3" value={item.service} onChange={(event) => onChange({ ...item, service: event.target.value })}>{(sections.length ? sections : [item.service]).map((name) => <option key={name} value={name}>{name}</option>)}</select>
        <input className="box-border min-h-11 w-full rounded-xl border border-line px-3" value={item.name} onChange={(event) => onChange({ ...item, name: event.target.value })} placeholder="Item name" />
        <input className="box-border min-h-11 w-full rounded-xl border border-line px-3" value={item.price} onChange={(event) => onChange({ ...item, price: event.target.value })} placeholder="Price" />
        <input className="box-border min-h-11 w-full rounded-xl border border-line px-3" value={item.detail} onChange={(event) => onChange({ ...item, detail: event.target.value })} placeholder="Description" />
      </div> : null}
    </div>
  );
}
