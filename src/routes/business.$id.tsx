import { ChatThread } from "@/components/common/ChatThread";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Keep } from "@/components/common/Keep";
import { BackButton, Card, NeedsAccount, Shell, ViewOnly, backButtonClass } from "@/components/common/Shell";
import { ReportModal } from "@/components/common/ReportModal";
import { ModeratorEdit } from "@/components/desk/ModeratorEdit";
import { MapView } from "@/components/common/MapView";
import { areaFor, ownsRecord, visibleEvents } from "@/lib/common/model";
import { COVERS } from "@/lib/common/covers";
import { logoFor, pictureFor } from "@/lib/common/pictures";
import { locationMessage, readPosition } from "@/lib/common/location";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/business/$id")({
  validateSearch: (search: Record<string, unknown>) => ({
    from: search.from === "saved" || search.from === "favourite" || search.from === "desk" ? search.from : "",
  }),
  component: BusinessPage,
});

function BusinessPage() {
  const { id } = Route.useParams();
  const { from } = Route.useSearch();
  const navigate = useNavigate();
  const business = useCommon((state) => state.businesses.find((row) => row.id === id));
  const account = useCommon((state) => state.account);
  const follows = useCommon((state) => state.follows);
  const follow = useCommon((state) => state.follow);
  const enquire = useCommon((state) => state.enquire);
  const replyEnquiry = useCommon((state) => state.replyEnquiry);
  const [replyTo, setReplyTo] = useState("");
  const [replyText, setReplyText] = useState("");
  const enquiries = useCommon((state) => state.enquiries);
  const report = useCommon((state) => state.report);
  const block = useCommon((state) => state.block);
  const blocked = useCommon((state) => state.blocked ?? []);
  const noteDirections = useCommon((state) => state.noteDirections);
  const noteShare = useCommon((state) => state.noteShare);
  const ratings = useCommon((state) => state.ratings);
  const rate = useCommon((state) => state.rate);
  const offers = useCommon((state) => state.offers);
  const businessEvents = visibleEvents(useCommon((state) => state.events)).filter(
    (row) => row.businessId === id && row.status === "published",
  );
  const bookings = useCommon((state) => state.bookings);
  const requestBooking = useCommon((state) => state.requestBooking);
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportRef, setReportRef] = useState("");
  const [start, setStart] = useState("");
  const [origin, setOrigin] = useState("");
  const [locateNote, setLocateNote] = useState("");
  const [service, setService] = useState("");
  const [treatment, setTreatment] = useState("");
  const [whenDate, setWhenDate] = useState("");
  const [whenTime, setWhenTime] = useState("");
  const [covers, setCovers] = useState("2");
  const [hold, setHold] = useState("");
  const [ratingOpen, setRatingOpen] = useState(false);

  if (!business || (business.status !== "published" && from !== "desk")) {
    return (
      <Shell>
        <Card>
          <h1 className="text-xl font-semibold">This page is not public</h1>
          <p className="mt-2 text-sm text-muted">It is waiting for a person, or it was refused. Guests cannot see it.</p>
        </Card>
      </Shell>
    );
  }

  const area = areaFor(business.postcode);
  const picked = (business.services ?? []).includes(service) ? service : "";
  const chosen = business.id === "biz_f4393427-4b76-e6d7-54b8-870177dfa5b6" ? picked : picked || (business.services?.[0] ?? "");
  const priced = (business.menu ?? []).filter((item) => item.service === chosen);
  const requested = priced.find((item) => item.name === treatment);
  const followed = follows.includes(business.id);
  const mine = enquiries.filter((row) => row.businessId === id && row.from === account?.name);
  const publicOffers = offers.filter((row) => row.businessId === id && row.status === "published");
  const myHolds = bookings.filter((row) => row.businessId === id && row.accountName === account?.name);
  const serviceTrade = business.trade === "service";
  const foodBusiness = !serviceTrade && (business.shelf === "menu" || /brunch|cocktail|restaurant|pub|bar|dining|deli|cafe|coffee/i.test(`${business.category} ${business.name}`));
  const canBook = serviceTrade ? business.appointments !== false : business.bookings !== false && foodBusiness;
  const shelf = business.shelf ?? (serviceTrade ? "services" : "menu");
  const shelfTitle = shelf === "products" ? "Products" : shelf === "services" ? "Services" : "Menu";
  const scores = ratings.filter((row) => row.businessId === id);
  const average = scores.length ? (scores.reduce((sum, row) => sum + row.stars, 0) / scores.length).toFixed(1) : "";
  const mineScore = scores.find((row) => row.accountName === account?.name)?.stars;

  const destination = `${business.name}, ${business.address}, ${business.postcode}, London`;
  const routeHref = origin
    ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;

  function showRoute(from: string, note = "") {
    const next = from.trim();
    if (!next) return;
    setOrigin(next);
    setLocateNote(note);
    noteDirections(business!.id);
  }

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
      <div className="grid gap-3">
        {from === "desk" ? <ModeratorEdit kind="business" id={business.id} fields={[{ key: "name", label: "Name", value: business.name }, { key: "category", label: "Category", value: business.category }, { key: "about", label: "Description", value: business.about }, { key: "address", label: "Address", value: business.address }, { key: "postcode", label: "Postcode", value: business.postcode }, { key: "phone", label: "Phone", value: business.phone }, { key: "email", label: "Email", value: business.email }, { key: "hours", label: "Hours", value: business.hours }, { key: "website", label: "Website", value: business.website }]} media={{ logo: business.logo, cover: business.hero || business.cover, gallery: business.gallery }} /> : null}
        <div>
          <p className="text-xs tracking-[0.14em] text-muted">
            <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">{business.postcode.split(" ")[0]}</span>
            {business.category.toUpperCase()}
          </p>
          <div className="mt-3 flex items-start justify-between gap-2"><div className="flex min-w-0 items-center gap-3"><img src={logoFor(business.logo, business.id)} alt="" className="h-12 w-12 shrink-0 rounded-full bg-black object-cover" /><h1 className="min-w-0 break-words font-serif text-3xl leading-tight font-medium">{business.name}</h1></div><button type="button" className={backButtonClass} onClick={() => { noteShare(business.id); navigator.share ? navigator.share({ title: business.name, url: window.location.href }) : navigator.clipboard.writeText(window.location.href); }}>Share</button></div>
          <section className="mt-4 grid gap-2 rounded-2xl border border-line bg-white p-3">
            <p className="text-xs font-semibold tracking-[0.14em] text-primary">FEATURED</p>
            {business.reel ? <a href={business.reel} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary">Watch the reel</a> : <p className="text-sm text-muted">No featured reel yet.</p>}
          </section>
          <HeaderReel business={business} />
          <details open className="mt-4 rounded-2xl border border-line bg-white px-3 py-2">
            <summary className="cursor-pointer text-sm font-medium">About</summary>
            <p className="mt-3 font-serif text-lg leading-relaxed">{business.about}</p>
            {area?.note ? <p className="mt-2 text-sm text-warn">{area.note}</p> : null}
          </details>
        </div>
        <details className="rounded-2xl border border-line bg-white px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium">Promotions</summary>
          <div className="mt-3 grid gap-3">
        {publicOffers.map((offer) => (
          <div key={offer.id} className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_10px_24px_-18px_rgba(16,40,32,0.7)]">
            <img src={offer.upload || offer.image || pictureFor(`${offer.title} ${business.name}`, "business")} alt="" className="h-40 w-full object-cover" />
            <div className="p-4">
              <p className="text-xs font-semibold tracking-[0.14em] text-primary">PROMOTIONS</p>
              <p className="mt-1 flex items-baseline justify-between gap-3 font-medium">
                <span className="min-w-0 break-words">{offer.title}</span>
                {offer.price ? <span className="shrink-0 text-primary">{offer.price}</span> : null}
              </p>
              <p className="text-sm text-muted">{offer.detail}</p>
            </div>
          </div>
        ))}
          </div>
        </details>
        <details className="rounded-2xl border border-line bg-white px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium">{shelfTitle} and prices</summary>
          <div className="mt-3 grid gap-3">
        <div>
          <div className="flex flex-wrap gap-1.5">
            {(business.services ?? []).map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setService(name);
                  setTreatment("");
                }}
                className={`rounded-full px-2.5 py-1 text-xs ${name === chosen ? "bg-primary text-white" : "bg-band"}`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        <div className="grid min-w-0 gap-3">
          {(business.menu ?? []).filter((item) => item.service === chosen).length === 0 ? <p className="text-sm text-muted">Nothing in this section yet.</p> : null}
          <h2 className="text-base font-medium">{chosen || shelfTitle}</h2>
          <ul className="grid min-w-0 gap-2">
            {(business.menu ?? [])
              .filter((item) => item.service === chosen)
              .map((item) => (
                <li key={`${item.service}-${item.name}`}>
                  <button
                    type="button"
                    onClick={() => business.id === "biz_f4393427-4b76-e6d7-54b8-870177dfa5b6" ? setTreatment(item.name) : undefined}
                    className={`w-full rounded-2xl border px-3 py-2 text-left ${business.id === "biz_f4393427-4b76-e6d7-54b8-870177dfa5b6" && item.name === treatment ? "border-primary bg-band" : "border-line bg-white"}`}
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="font-medium">{item.name}</span>
                      <span className="shrink-0 text-sm text-primary">{item.price}</span>
                    </span>
                    <span className="mt-1 block text-sm text-muted">{item.detail}</span>
                  </button>
                </li>
              ))}
          </ul>
          {(business.menu ?? []).some((item) => item.service === chosen) ? null : (
            <p className="mt-2 text-sm text-muted">{chosen ? `No public price for ${chosen} yet.` : "Choose a service above to see the prices."}</p>
          )}
          <p className="mt-2 text-xs text-muted">{business.menuNote}</p>
        {canBook ? <div className="mt-4"><Card>
          <h2 className="text-lg">{serviceTrade ? "Book an appointment" : "Book a table"}</h2>
          <p className="mt-1 text-sm text-muted">
            {business.id === "biz_f4393427-4b76-e6d7-54b8-870177dfa5b6"
              ? "BE U Studio asks you to complete the consultation and consent form before this request is held. Nothing is paid, and the studio has not confirmed it."
              : serviceTrade
                ? "A request for this studio. It is held on this phone with a code. The studio has not confirmed it, and nothing is paid."
                : "A table request for this place. It is held on this phone with a code. The business has not confirmed it, and nothing is paid."}
          </p>
          {account ? (
          <form
            className="mt-3 grid gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!whenDate || !whenTime) {
                setHold("Choose a date and a time.");
                return;
              }
                if (business.id === "biz_f4393427-4b76-e6d7-54b8-870177dfa5b6") {
                  if (!chosen) {
                    setHold("Choose a service above the prices.");
                    return;
                  }
                  if (priced.length > 0 && !requested) {
                    setHold("Choose the treatment from the prices under that service.");
                    return;
                  }
                  void navigate({
                    to: "/beu-consent",
                    search: { service: chosen, treatment: requested?.name ?? chosen, date: whenDate, time: whenTime },
                  });
                  return;
                }
                const result = requestBooking({
                  businessId: business.id,
                  kind: serviceTrade ? "service" : "table",
                  party: serviceTrade ? chosen : `${covers} people`,
                  when: `${whenDate} ${whenTime}`.trim(),
                });
                setHold(result.ok ? result.code : result.reason);
            }}
          >
            {serviceTrade ? (
              <p className="text-sm">
                {business.id === "biz_f4393427-4b76-e6d7-54b8-870177dfa5b6"
                  ? chosen
                    ? `Service: ${chosen}${requested ? ` · ${requested.name} · ${requested.price}` : priced.length ? " · choose a treatment from the prices" : ""}`
                    : "Choose a service above the prices."
                  : `Service: ${chosen || "Choose one above"}`}
              </p>
            ) : (
              <label className="grid gap-1 text-sm">
                People
                <select value={covers} onChange={(event) => setCovers(event.target.value)} className="min-h-11 rounded-xl border border-line bg-white px-3">
                  {["1", "2", "3", "4", "5", "6", "7", "8"].map((count) => (
                    <option key={count} value={count}>{count}</option>
                  ))}
                </select>
              </label>
            )}
            <div className="grid grid-cols-2 gap-2">
              <label className="grid gap-1 text-sm">
                Date
                <input type="date" value={whenDate} onChange={(event) => setWhenDate(event.target.value)} className="min-h-11 rounded-xl border border-line bg-white px-3" />
              </label>
              <label className="grid gap-1 text-sm">
                Time
                <input type="time" value={whenTime} onChange={(event) => setWhenTime(event.target.value)} className="min-h-11 rounded-xl border border-line bg-white px-3" />
              </label>
            </div>
            <button type="submit" className="min-h-11 rounded-xl bg-primary px-3 text-sm font-medium text-white">
              {serviceTrade ? "Request an appointment" : "Request a table"}
            </button>
          </form>
          ) : <div className="mt-3">{<NeedsAccount next={`/business/${business.id}`} />}</div>}
          {hold ? <p className="mt-2 text-sm">{hold.startsWith("TC.") ? `Your code: ${hold}. Show this at the door. The owner can scan it.` : hold}</p> : null}
          <p className="mt-2 text-xs text-muted">Your name, contact details, party size and time go to {business.name} to handle your booking. We keep bookings for 12 months after the booking date. Claim codes expire after the booking date. See our <a href="/legal?page=privacy" className="text-primary">Privacy Notice</a>.</p>
          {myHolds.map((row) => (
            <p key={row.id} className="mt-2 text-sm text-muted">{row.party} · {row.when} · {row.code}</p>
          ))}
        </Card></div> : null}
        </div>
          </div>
        </details>
        {business.chatOn !== false ? <details className="rounded-2xl border border-line bg-white px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium">Chat with the store</summary>
          <div className="mt-3">
        <Card>
          <h2 className="sr-only">Chat with the store</h2>
          <p className="mt-1 text-sm text-muted">A note to the shop, not a chat with the whole neighbourhood. It stays on this phone until they reply.</p>
<div className="mt-3"><ChatThread notes={mine} onReply={ownsRecord(business, account) ? replyEnquiry : undefined} /></div>
          {account ? (
          <form
            className="mt-3 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const text = body.trim();
              if (!text) return;
              enquire(business.id, text);
              setBody("");
              setSent(true);
            }}
          >
            <input
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Message the store"
              className="min-h-11 flex-1 rounded-xl border border-line bg-white px-3"
            />
            <button type="submit" className="min-h-11 rounded-xl bg-primary px-4 text-sm font-medium text-white">
              Send
            </button>
          </form>
          ) : (<NeedsAccount next={`/business/${business.id}`} />)}
          {sent ? <p className="mt-2 text-xs text-muted">Sent to {business.name}. They reply in their inbox. The request reaches the business owner.</p> : null}
          <p className="mt-2 text-xs text-muted">Your name, email and message go to {business.name} so they can reply. We keep enquiries for 12 months. See our <a href="/legal?page=privacy" className="text-primary">Privacy Notice</a>.</p>
        </Card>
          </div>
        </details> : null}
        <details className="rounded-2xl border border-line bg-white px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium">Map and directions</summary>
          <div className="mt-3 grid gap-3">
            <MapView place={business} origin={origin || undefined} />
            <form
              className="grid gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                showRoute(start);
              }}
            >
              <label className="grid gap-1 text-sm">
                Starting point
                <input
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
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
            <a className="text-sm font-medium text-primary" href={routeHref} target="_blank" rel="noreferrer" onClick={() => noteDirections(business.id)}>
              Open the route in Google Maps
            </a>
            <p className="text-sm">{business.address}, London {business.postcode}</p>
          </div>
        </details>
        <details className="rounded-2xl border border-line bg-white px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium">Social</summary>
          <div className="mt-3 grid gap-2 text-sm">
            {business.social?.instagram ? <a className="font-medium text-primary" href={business.social.instagram} target="_blank" rel="noreferrer">Instagram</a> : null}
            {business.social?.facebook ? <a className="font-medium text-primary" href={business.social.facebook} target="_blank" rel="noreferrer">Facebook</a> : null}
            {business.social?.tiktok ? <a className="font-medium text-primary" href={business.social.tiktok} target="_blank" rel="noreferrer">TikTok</a> : null}
            {business.social?.x ? <a className="font-medium text-primary" href={business.social.x} target="_blank" rel="noreferrer">X</a> : null}
            {!business.social?.instagram && !business.social?.facebook && !business.social?.tiktok && !business.social?.x ? <p className="text-muted">No social links yet.</p> : null}
          </div>
        </details>
        <details className="rounded-2xl border border-line bg-white px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium">Opening and closing times</summary>
          {business.hours && !business.hours.includes("not checked") ? <p className="mt-3 text-sm">{business.hours}</p> : <p className="mt-3 text-sm text-muted">Hours not listed yet.</p>}
          {(business.specialHours ?? []).length ? (
            <div className="mt-3 grid gap-2">
              {business.specialHours?.map((row) => (
                <p key={`${row.label}-${row.from}`} className="rounded-xl bg-band px-3 py-2 text-sm">{row.label}: {row.from} to {row.to}. {row.closed ? "Closed." : `${row.opens} to ${row.closes}.`}</p>
              ))}
            </div>
          ) : null}
        </details>
        <details className="rounded-2xl border border-line bg-white px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium">Contact details</summary>
          <div className="mt-3 grid gap-2">
            {business.phone ? (
              <a href={`tel:${business.phone.replace(/\s/g, "")}`} className="min-h-11 rounded-xl bg-primary px-3 py-3 text-center text-sm font-medium text-white">
                Call
              </a>
            ) : null}
            {business.email.includes("@") ? (
              <a href={`mailto:${business.email}`} className="min-h-11 rounded-xl border border-primary bg-white px-3 py-3 text-center text-sm font-medium text-primary">
                Email
              </a>
            ) : null}
            {business.website ? (
              <a href={business.website} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary">
                {business.website.includes("eatclub") || business.website.includes("treatwell") ? `View on ${new URL(business.website).hostname}` : "Open the website"}
              </a>
            ) : null}
          </div>
        </details>
        <div>

        </div>
        <div className="grid gap-2">
          <Link to="/events" search={{ business: business.id, mine: "", keep: "" }} className="min-h-11 rounded-xl border border-primary bg-white px-3 py-3 text-center text-sm font-medium text-primary">
            Our Events
          </Link>
          {businessEvents.length === 0 ? (
            <p className="text-sm text-muted">No published event for {business.name} yet.</p>
          ) : (
            businessEvents.map((event) => (
              <Link key={event.id} to="/event/$id" params={{ id: event.id }} search={{ from: "" }} className="grid grid-cols-[4.5rem_1fr] items-center gap-2 rounded-xl border border-line bg-white px-2 py-2">
                <img src={event.image || pictureFor(`${event.title} ${event.kind} ${event.detail || ""}`, "event")} alt="" className="h-16 w-full rounded-lg object-cover" onError={(node) => { if (node.currentTarget.dataset.fell) return; node.currentTarget.dataset.fell = "1"; node.currentTarget.src = pictureFor(`${event.title} ${event.kind}`, "event"); }} />
                <span><span className="text-xs text-muted">{event.kind} · {event.when}</span><span className="mt-1 block font-medium">{event.title}</span></span>
              </Link>
            ))
          )}
          <Link to="/market" search={{ business: business.id, mine: "", create: "", keep: "" }} className="min-h-11 rounded-xl border border-primary bg-white px-3 py-3 text-center text-sm font-medium text-primary">
            Other
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {account ? (
            <>
          <button
            type="button"
            className="min-h-11 rounded-xl bg-primary px-3 text-sm font-medium text-white"
            onClick={() => follow(business.id)}
          >
            {followed ? "Following" : "Follow"}
          </button>
          <button
            type="button"
            className="min-h-11 rounded-xl border border-primary bg-white px-3 text-sm font-medium text-primary"
            onClick={() => setReportOpen(true)}
          >
            {reportRef ? `Report sent · ${reportRef}` : "Report"}
          </button>
          <button type="button" className="min-h-11 rounded-xl border border-line px-3 text-sm" onClick={() => block(business.id)}>{blocked.includes(business.id) ? "Blocked" : "Block"}</button>
          <ReportModal open={reportOpen} target="business" onClose={() => setReportOpen(false)} onSend={(reason, detail) => { const id = report(business.name, detail, reason); setReportRef(id); return id; }} />
            </>
          ) : <div className="col-span-2">{<NeedsAccount next={`/business/${business.id}`} />}</div>}
        </div>
        <p className="text-xs text-muted">If someone is in danger, call 999. This is not an emergency service.</p>
        </div>
    </Shell>
  );
}

function HeaderReel({ business }: { business: { id: string; name: string; category?: string; cover?: string; hero?: string; gallery?: string[]; video?: string } }) {
  const slides = [business.hero || business.cover || COVERS[business.id] || pictureFor(`${business.name} ${business.category || ""}`, "business"), ...(business.gallery ?? [])].filter(Boolean).slice(0, 4);
  const frames = business.video ? [...slides, business.video] : slides;
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (frames.length < 2) return;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % frames.length), 5000);
    return () => window.clearInterval(timer);
  }, [frames.length]);
  const current = frames[index] || "";
  const video = current === business.video;
  return (
    <div className="relative mt-4 overflow-hidden rounded-2xl shadow-[0_16px_32px_-20px_rgba(16,40,32,0.85)]">
      {video ? (
        <video src={current} className="block h-52 w-full object-cover" autoPlay muted playsInline onTimeUpdate={(event) => { if (event.currentTarget.currentTime >= 5) event.currentTarget.pause(); }} />
      ) : current ? (
        <img src={current} alt="" className="block h-52 w-full object-cover" />
      ) : <div className="h-52 bg-band" />}
      <Keep overlay id={business.id} next={`/business/${business.id}`} title={business.name} />
      {frames.length > 1 ? (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
          {frames.map((_, dot) => <button key={dot} type="button" aria-label={`Slide ${dot + 1}`} className={`h-2 w-2 rounded-full ${dot === index ? "bg-white" : "bg-white/50"}`} onClick={() => setIndex(dot)} />)}
        </div>
      ) : null}
    </div>
  );
}
