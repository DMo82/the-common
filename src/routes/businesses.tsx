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
  const hereFirst = [...shown].sort((a, b) => {
    const aHere = areaFor(a.postcode)?.discoveryName === here.neighbourhood ? 0 : 1;
    const bHere = areaFor(b.postcode)?.discoveryName === here.neighbourhood ? 0 : 1;
    return aHere - bHere;
  });

  return (
    <Shell>
      <div className="grid gap-2">
        {keep ? (
          <div>
            <h1 className="text-2xl leading-none font-medium">{keep === "saved" ? "Saved businesses" : "Favourite businesses"}</h1>
          </div>
        ) : (
        <label className="flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-sm text-muted shadow-[0_8px_20px_-16px_rgba(16,40,32,0.8)]">
          <span aria-hidden>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or category"
            className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-muted"
          />
        </label>
        )}
        {keep ? null : <AreaBar here={here} />}
        {hereFirst.length === 0 ? (
          <p className="rounded-2xl bg-band p-3 text-sm text-muted">
            {keep ? "Nothing here yet." : query.trim() ? "Nothing matches that search." : "No published businesses in this preview."}
          </p>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          {hereFirst.map((business) => {
            const offer = offers.find((row) => row.businessId === business.id && row.status === "published");
            const photo = business.hero || business.cover || COVERS[business.id] || pictureFor(`${business.name} ${business.category}`, "business");
            const logo = logoFor(business.logo, business.id);
            return (
              <div key={business.id}>
              <Link
                to="/business/$id"
                params={{ id: business.id }}
                search={{ from: keep }}
                className="relative block h-40 overflow-hidden rounded-2xl bg-deep text-white shadow-[0_12px_28px_-18px_rgba(16,40,32,0.85)]"
              >
                {photo ? <img loading="lazy" decoding="async" src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
                <img src={logo} alt="" className="absolute top-2 left-2 h-8 w-8 rounded-full bg-black object-cover" />
                <span className={`absolute inset-0 ${photo ? "bg-gradient-to-t from-black/75 via-black/15 to-transparent" : "bg-gradient-to-br from-[#003820] via-[#1d4a32] to-[#102820]"}`} />
                <span className="absolute inset-x-0 bottom-0 grid gap-0.5 p-3">
                  <span className="w-fit rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white ring-1 ring-white/25">{business.postcode.split(" ")[0]}</span>
                  <span className="line-clamp-2 font-serif text-lg leading-tight">{business.name}</span>
                  <span className="text-[11px] text-white/85">{offer ? offer.title : business.category}</span>
                </span>
              </Link>
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
