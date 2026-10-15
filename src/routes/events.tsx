import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AreaBar, useHere } from "@/components/common/AreaBar";
import { BackButton, Chip, Shell, backButtonClass } from "@/components/common/Shell";
import { areaFor, EVENT_KINDS, ownsRecord, visibleEvents, type EventKind, type LocalEvent } from "@/lib/common/model";
import { pictureFor } from "@/lib/common/pictures";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/events")({
  validateSearch: (search: Record<string, unknown>) => ({
    business: typeof search.business === "string" ? search.business : "",
    mine: search.mine === "1" ? "1" : "",
    keep: search.keep === "saved" || search.keep === "favourite" ? search.keep : "",
  }),
  component: EventsPage,
});

function EventCard({ event, host, first, from }: { event: LocalEvent; host?: string; first: boolean; from: "" | "saved" | "favourite" }) {
  return (
    <div>
      <Link to="/event/$id" params={{ id: event.id }} search={{ from }} className="block">
      <span className="block overflow-hidden rounded-2xl shadow-[0_12px_28px_-18px_rgba(16,40,32,0.8)]">
          <img loading="lazy" decoding="async" src={event.image || pictureFor(`${event.title} ${event.kind} ${event.detail || ""}`, "event")} alt="" className="h-44 w-full object-cover" onError={(node) => { if (node.currentTarget.dataset.fell) return; node.currentTarget.dataset.fell = "1"; node.currentTarget.src = pictureFor(`${event.title} ${event.kind} ${event.detail || ""}`, "event"); }} />
        </span>
      <span className="block py-2">
        {first ? <span className="text-xs tracking-[0.14em] text-muted">EVENT</span> : null}
        <span className="mt-2 block text-xs tracking-wide text-muted">
          <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">{event.neighbourhood || "Lambeth"}</span>
          {event.kind} · {host || event.place}
        </span>
        <span className="mt-1 block font-serif text-2xl leading-tight">{event.title}</span>
        <span className="mt-1 block text-sm text-muted">{event.when}</span>
      </span>
      </Link>
    </div>
  );
}

function isPast(when: string) {
  const match = when.match(/(\d{1,2})\s+([A-Za-z]+)\s+(20\d{2})/g);
  if (!match) return false;
  const last = match[match.length - 1];
  const parts = last.match(/(\d{1,2})\s+([A-Za-z]+)\s+(20\d{2})/);
  if (!parts) return false;
  const months = ["january","february","march","april","may","june","july","august","september","october","november","december"];
  const month = months.indexOf(parts[2].toLowerCase());
  if (month < 0) return false;
  const day = new Date(Number(parts[3]), month, Number(parts[1]), 23, 59);
  return day.getTime() < Date.now();
}

function EventsPage() {
  const { business: businessId, mine, keep } = Route.useSearch();
  const stored = useCommon((state) => state.events);
  const events = visibleEvents(stored);
  const businesses = useCommon((state) => state.businesses);
  const account = useCommon((state) => state.account);
  const saves = useCommon((state) => state.saves ?? []);
  const favourites = useCommon((state) => state.favourites ?? []);
  const here = useHere();
  const [kind, setKind] = useState<EventKind | "All">("All");
  const owner = businesses.find((row) => row.id === businessId);
  const ownedIds = new Set(businesses.filter((row) => ownsRecord(row, account)).map((row) => row.id));
  const matches = (row: LocalEvent) => kind === "All" || (row.kind ?? "Community") === kind;
  const mineEvents = stored.filter((row) => (ownsRecord(row, account) || ownedIds.has(row.businessId)) && matches(row));
  const publishedEvents = events.filter((row) => row.status === "published" && !row.sample && matches(row) && !isPast(row.when));
  const owned = businessId ? publishedEvents.filter((row) => row.businessId === businessId) : [];
  const placeOf = (row: (typeof events)[number]) => {
    const business = businesses.find((item) => item.id === row.businessId);
    return row.neighbourhood || (business ? areaFor(business.postcode)?.discoveryName : "") || "Lambeth";
  };
  const localEvents = businessId ? [] : publishedEvents.filter((row) => placeOf(row) === here.neighbourhood);
  const otherEvents = businessId ? [] : publishedEvents.filter((row) => placeOf(row) !== here.neighbourhood);
  const picked = keep === "saved" ? saves : keep === "favourite" ? favourites : null;
  const keptEvents = picked ? stored.filter((row) => picked.includes(row.id) && matches(row)) : [];
  const keptTitle = keep === "saved" ? "Saved events" : "Favourite events";

  return (
    <Shell>
      <div className="grid gap-2">
        <div>
          <h1 className="text-2xl leading-none font-medium">{keep ? keptTitle : mine ? "My events" : owner ? "Our Events" : "Events"}</h1>
        </div>
        {mine ? <p className="text-sm text-muted">Events this profile has created.</p> : keep ? <p className="text-sm text-muted">From the buttons on an event.</p> : owner ? <p className="text-sm text-muted">Events created for {owner.name}.</p> : <AreaBar here={here} />}
        <div className="flex min-w-0 max-w-full gap-1.5 overflow-x-auto pb-1">
          <Chip active={kind === "All"} onClick={() => setKind("All")}>All</Chip>
          {EVENT_KINDS.map((name) => (
            <Chip key={name} active={kind === name} onClick={() => setKind(name)}>{name}</Chip>
          ))}
        </div>
        {keep ? (
          keptEvents.length === 0 ? (
            <p className="text-sm text-muted">Nothing here yet.</p>
          ) : (
            keptEvents.map((event, index) => <EventCard key={event.id} event={event} host={businesses.find((item) => item.id === event.businessId)?.name} first={index === 0} from={keep === "favourite" ? "favourite" : "saved"} />)
          )
        ) : mine ? (
          mineEvents.length === 0 ? (
            <p className="text-sm text-muted">This profile has not created an event yet.</p>
          ) : (
            mineEvents.map((event, index) => <EventCard key={event.id} event={event} host={businesses.find((item) => item.id === event.businessId)?.name} first={index === 0} from="" />)
          )
        ) : businessId ? (
          owned.length === 0 ? (
            <p className="text-sm text-muted">{owner ? `${owner.name} has not created an event yet.` : "No events for this business yet."}</p>
          ) : (
            owned.map((event, index) => <EventCard key={event.id} event={event} host={businesses.find((item) => item.id === event.businessId)?.name} first={index === 0} from="" />)
          )
        ) : (
          <>
            {localEvents.length === 0 ? (
              <p className="text-sm text-muted">
                {kind === "All" ? `Quiet in ${here.neighbourhood} for the moment. More is listed just below.` : `No ${kind.toLowerCase()} in ${here.neighbourhood} right now. Have a look at All.`}
              </p>
            ) : null}
            {localEvents.length ? <p className="text-xs font-semibold tracking-[0.14em] text-primary">IN {here.neighbourhood.toUpperCase()}</p> : null}
            {localEvents.map((event, index) => (
              <EventCard key={event.id} event={event} host={businesses.find((item) => item.id === event.businessId)?.name} first={index === 0} from="" />
            ))}
            {otherEvents.length > 0 ? <p className="pt-2 text-xs tracking-[0.14em] text-muted">ALSO IN LAMBETH</p> : null}
            {otherEvents.map((event) => (
              <EventCard key={event.id} event={event} host={businesses.find((item) => item.id === event.businessId)?.name} first={false} from="" />
            ))}
          </>
        )}
      </div>
    </Shell>
  );
}
