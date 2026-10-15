import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AreaBar, useHere } from "@/components/common/AreaBar";
import { BackButton, Shell, backButtonClass } from "@/components/common/Shell";
import { areaFor } from "@/lib/common/model";
import { COVERS } from "@/lib/common/covers";
import { logoFor, pictureFor } from "@/lib/common/pictures";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/businesses")({
  validateSearch: (search: Record<string, unknown>) => ({
    keep: search.keep === "saved" || search.keep === "favourite" ? search.keep : "",
  }),
  component: BusinessesPage,
});

function BusinessesPage() {
  const { keep } = Route.useSearch();
  const businesses = useCommon((state) => state.businesses);
  const offers = useCommon((state) => state.offers);
  const saves = useCommon((state) => state.saves ?? []);
  const favourites = useCommon((state) => state.favourites ?? []);
  const [query, setQuery] = useState("");
  const here = useHere();
  const picked = keep === "saved" ? saves : keep === "favourite" ? favourites : null;
  const shown = businesses.filter((row) => {
    if (picked) return picked.includes(row.id);
    if (row.status !== "published") return false;
    const haystack = `${row.name} ${row.category} ${(row.services ?? []).join(" ")}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });
  const hereFirst = shown.filter((row) => areaFor(row.postcode)?.discoveryName === here.neighbourhood);

  return (
    <Shell>
      <div className="grid gap-2">
        {keep ? (
          <div>
            <h1 className="text-2xl leading-none font-medium">{keep === "saved" ? "Saved businesses" : "Favourite businesses"}</h1>
          </div>
        ) : (
        <label className="flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-sm text-muted shadow-[0_8px_20px_-16px_rgba(16,40,32,0.8)]">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A2E24" strokeWidth="1.75"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or category"
            className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-muted"
          />
          {query ? <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="text-sm text-muted">×</button> : null}
        </label>
        )}
        {keep ? null : <AreaBar here={here} />}
        <h1 className="sr-only">Local businesses in Lambeth</h1>
        {hereFirst.length === 0 ? (
          <p className="rounded-2xl bg-band p-3 text-sm text-muted">
            {keep ? "Nothing here yet." : query.trim() ? `No businesses match '${query}'.` : `No businesses in ${here.neighbourhood} yet.`}
          </p>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          {hereFirst.map((business) => {
            const offer = offers.find((row) => row.businessId === business.id && row.status === "published");
            const photo = business.hero || business.cover || COVERS[business.id] || pictureFor(`${business.name} ${business.category}`, "business");
            const logo = logoFor(business.logo, business.id);
            const initials = business.name.split(" ").slice(0, 2).map((word) => word[0]).join("").toUpperCase();
            return (
              <div key={business.id}>
              <Link
                to="/business/$id"
                params={{ id: business.id }}
                search={{ from: keep }}
                className="relative block h-40 overflow-hidden rounded-2xl bg-deep text-white shadow-[0_12px_28px_-18px_rgba(16,40,32,0.85)]"
              >
                {photo ? <img loading="lazy" decoding="async" src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
                {logo && logo !== "/brand/logo.png" ? <img src={logo} alt="" className="absolute top-2 left-2 h-8 w-8 rounded-full bg-black object-cover" /> : <span className="absolute top-2 left-2 grid h-10 w-10 place-items-center rounded-full bg-[#E8EDE9] text-sm font-bold text-[#003820] ring-2 ring-white">{initials}</span>}
                <span className={`absolute inset-0 ${photo ? "bg-gradient-to-t from-[#102820]/85 via-[#102820]/20 to-transparent" : "bg-gradient-to-br from-[#003820] via-[#1d4a32] to-[#102820]"}`} />
                <span className="absolute inset-x-0 bottom-0 grid gap-0.5 p-3">
                  <span className="w-fit rounded-full bg-[#F8B830] px-2 py-0.5 text-xs font-semibold text-[#102820]">{business.postcode.split(" ")[0]}</span>
                  <span className="line-clamp-2 text-lg font-semibold leading-6 text-white">{business.name}</span>
                  <span className="text-sm text-white">{offer ? offer.title : business.category}</span>
                </span>
              </Link>
              </div>
            );
          })}
        </div>
        <Link to="/signup" search={{ next: "/businesses", email: "" }} className="mt-4 block rounded-2xl border border-line bg-white p-3 text-center text-sm font-medium text-primary">Add your business</Link>
      </div>
    </Shell>
  );
}
