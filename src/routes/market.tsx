import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AreaBar, useHere } from "@/components/common/AreaBar";
import { BackButton, Shell, backButtonClass } from "@/components/common/Shell";
import {
  CONDITIONS,
  LISTING_TYPES,
  MARKET_CATEGORIES,
  PRICE_BANDS,
  describeListing,
  listingTypeLabel,
  presentListing,
  bandForAmount,
  listedAgo,
  listedAt,
  subcategories,
  visibleListings,
  type ConditionId,
  type ListingTypeId,
  type PriceBandId,
} from "@/lib/common/market";
import { areaFor, ownsRecord } from "@/lib/common/model";
import { pictureFor } from "@/lib/common/pictures";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/market")({
  validateSearch: (search: Record<string, unknown>) => ({
    business: typeof search.business === "string" ? search.business : "",
    mine: search.mine === "1" ? "1" : "",
    create: search.create === "1" ? "1" : "",
    keep: search.keep === "saved" || search.keep === "favourite" ? search.keep : "",
  }),
  component: MarketPage,
});

function MarketPage() {
  const { business: businessId, mine, create, keep } = Route.useSearch();
  const navigate = useNavigate();
  const listings = visibleListings(useCommon((state) => state.listings));
  const businesses = useCommon((state) => state.businesses);
  const account = useCommon((state) => state.account);
  const saves = useCommon((state) => state.saves ?? []);
  const favourites = useCommon((state) => state.favourites ?? []);
  const postListing = useCommon((state) => state.postListing);
  const [open, setOpen] = useState(create === "1");
  useEffect(() => {
    if (create === "1") setOpen(true);
  }, [create]);
  const [category, setCategory] = useState("All");
  const [subcategory, setSubcategory] = useState("All");
  const [listingType, setListingType] = useState<"All" | ListingTypeId>("All");
  const [condition, setCondition] = useState<"All" | ConditionId>("All");
  const [price, setPrice] = useState<"All" | PriceBandId>("All");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [draftCategory, setDraftCategory] = useState<string>(MARKET_CATEGORIES[0].name);
  const [draftSub, setDraftSub] = useState<string>(MARKET_CATEGORIES[0].items[0]);
  const [draftType, setDraftType] = useState<ListingTypeId>("sale");
  const [draftCondition, setDraftCondition] = useState<ConditionId | "">("good");
  const [draftPrice, setDraftPrice] = useState<PriceBandId | "">("10-50");
  const [asking, setAsking] = useState("");
  const [image, setImage] = useState("");
  const [video, setVideo] = useState("");
  const [mediaNote, setMediaNote] = useState("");
  const [saved, setSaved] = useState("");
  const [forBusiness, setForBusiness] = useState(businessId);
  const here = useHere();
  const owner = businesses.find((row) => row.id === businessId);
  const published = businesses.filter((row) => row.status === "published");
  const subs = category === "All" ? [] : subcategories(category);
  const draftSubs = subcategories(draftCategory);

  const ownedIds = new Set(businesses.filter((row) => ownsRecord(row, account)).map((row) => row.id));
  const shown = useMemo(() => {
    return listings.filter((row) => {
      if (keep) {
        const picked = keep === "saved" ? saves : favourites;
        return picked.includes(row.id);
      }
      const createdHere = ownsRecord(row, account) || ownedIds.has(row.businessId);
      if (mine) {
        if (!createdHere) return false;
      } else {
        const onThisBusiness = Boolean(businessId && row.businessId === businessId);
        if (row.status !== "published" && !(onThisBusiness && row.status === "pending")) return false;
        if (businessId && row.businessId !== businessId) return false;
      }
      const described = describeListing(row);
      if (category !== "All" && described.category !== category) return false;
      if (subcategory !== "All" && described.subcategory !== subcategory) return false;
      if (listingType !== "All" && described.listingType !== listingType) return false;
      if (condition !== "All" && described.condition !== condition) return false;
      if (price !== "All" && described.priceBand !== price) return false;
      return true;
    }).sort((a, b) => {
      const areaOf = (row: { businessId: string }) => areaFor(businesses.find((shop) => shop.id === row.businessId)?.postcode ?? "")?.discoveryName;
      const aHere = areaOf(a) === here.neighbourhood ? 0 : 1;
      const bHere = areaOf(b) === here.neighbourhood ? 0 : 1;
      return aHere - bHere || listedAt(b) - listedAt(a);
    });
  }, [listings, businesses, here.neighbourhood, businessId, mine, account, ownedIds, category, subcategory, listingType, condition, price, keep, saves, favourites]);

  return (
    <Shell>
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-serif text-3xl text-deep">{keep === "saved" ? "Saved listings" : keep === "favourite" ? "Favourite listings" : mine ? "My marketplace listings" : owner ? "Our Marketplace listings" : "Marketplace"}</h1>
          <div className="flex shrink-0 items-center gap-2">
            {account ? (
            <button type="button" className="h-8 shrink-0 rounded-lg bg-primary px-2.5 text-xs font-medium text-white" onClick={() => setOpen((value) => !value)}>
              Create listing
            </button>
            ) : null}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setSubcategory("All");
            }}
            className="min-h-9 rounded-xl border border-line bg-white px-2 text-sm"
            aria-label="Category"
          >
            <option value="All">All categories</option>
            {MARKET_CATEGORIES.map((row) => (
              <option key={row.name} value={row.name}>{row.name}</option>
            ))}
          </select>
          <select
            value={subcategory}
            onChange={(event) => setSubcategory(event.target.value)}
            className="min-h-9 rounded-xl border border-line bg-white px-2 text-sm"
            aria-label="Subcategory"
            disabled={category === "All"}
          >
            <option value="All">{category === "All" ? "Subcategory" : "All in category"}</option>
            {subs.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <select value={listingType} onChange={(event) => setListingType(event.target.value as "All" | ListingTypeId)} className="min-h-9 rounded-xl border border-line bg-white px-2 text-sm" aria-label="Listing type">
            <option value="All">All listing types</option>
            {LISTING_TYPES.map((row) => (
              <option key={row.id} value={row.id}>{row.label}</option>
            ))}
          </select>
          <select value={condition} onChange={(event) => setCondition(event.target.value as "All" | ConditionId)} className="min-h-9 rounded-xl border border-line bg-white px-2 text-sm" aria-label="Condition">
            <option value="All">Any condition</option>
            {CONDITIONS.map((row) => (
              <option key={row.id} value={row.id}>{row.label}</option>
            ))}
          </select>
          <select value={price} onChange={(event) => setPrice(event.target.value as "All" | PriceBandId)} className="col-span-2 min-h-9 rounded-xl border border-line bg-white px-2 text-sm" aria-label="Price">
            <option value="All">Any price</option>
            {PRICE_BANDS.map((row) => (
              <option key={row.id} value={row.id}>{row.label}</option>
            ))}
          </select>
        </div>
        {saved ? <p className="text-sm text-muted">{saved}</p> : null}
        {open && account ? (
          <form
            className="grid gap-2 rounded-2xl border border-line bg-white p-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!account) {
                void navigate({ to: "/account", search: { next: businessId ? `/market?business=${businessId}` : "/market" } });
                return;
              }
              if (title.trim().length < 5) {
                setSaved("Title needs at least 5 characters.");
                return;
              }
              if (!image) {
                setSaved("Add a picture before this can be sent.");
                return;
              }
              const priceValue = asking.trim();
              if (priceValue && !/^\d{1,5}(\.\d{2})?$/.test(priceValue)) {
                setSaved("Enter a price in pounds, like 12 or 12.50.");
                return;
              }
              const nextKind = draftCategory === "Jobs & Services" || draftType === "service" ? "job" : "equipment";
              const priced = asking.trim() ? bandForAmount(asking) : { priceBand: draftPrice, priceLabel: PRICE_BANDS.find((row) => row.id === draftPrice)?.label ?? "" };
              postListing({
                businessId: forBusiness || published[0]?.id || "",
                kind: nextKind,
                title,
                detail,
                category: draftCategory,
                subcategory: draftSub,
                listingType: draftType,
                condition: draftCondition,
                priceBand: priced.priceBand,
                priceLabel: priced.priceLabel,
                image,
                video,
              });
              setTitle("");
              setDetail("");
              setAsking("");
              setImage("");
              setVideo("");
              setMediaNote("");
              setOpen(false);
              setSaved("Saved. It will sit quietly until a person says it can go up.");
            }}
          >
            <label className="grid gap-1 text-sm">
              Listing as
              <select value={forBusiness || ""} onChange={(event) => setForBusiness(event.target.value)} className="min-h-11 rounded-xl border border-line bg-white px-3">
                <option value="">Me (personal)</option>
                {published.filter((row) => ownsRecord(row, account)).map((row) => (
                  <option key={row.id} value={row.id}>{row.name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Category
              <select
                value={draftCategory}
                onChange={(event) => {
                  const name = event.target.value;
                  setDraftCategory(name);
                  setDraftSub(subcategories(name)[0] ?? "");
                }}
                className="min-h-11 rounded-xl border border-line bg-white px-3"
              >
                {MARKET_CATEGORIES.map((row) => (
                  <option key={row.name} value={row.name}>{row.name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Subcategory
              <select value={draftSub} onChange={(event) => setDraftSub(event.target.value)} className="min-h-11 rounded-xl border border-line bg-white px-3">
                {draftSubs.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Type
              <select value={draftType} onChange={(event) => setDraftType(event.target.value as ListingTypeId)} className="min-h-11 rounded-xl border border-line bg-white px-3">
                {LISTING_TYPES.map((row) => (
                  <option key={row.id} value={row.id}>{row.label}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Condition
              <select value={draftCondition} onChange={(event) => setDraftCondition(event.target.value as ConditionId | "")} className="min-h-11 rounded-xl border border-line bg-white px-3">
                <option value="">No condition</option>
                {CONDITIONS.map((row) => (
                  <option key={row.id} value={row.id}>{row.label}</option>
                ))}
              </select>
            </label>
            <input value={asking} onChange={(event) => setAsking(event.target.value)} placeholder="Price, such as 12 or 12.50" inputMode="decimal" className="min-h-11 rounded-xl border border-line bg-white px-3" />
            <label className="grid gap-1 text-sm">
              Picture
              <input
                type="file"
                accept="image/*"
                className="text-sm"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (file.size > 1_500_000) {
                    setMediaNote("That file is too large to keep on this phone. Choose a photo under 1.5MB.");
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = String(reader.result || "");
                    if (file.type.startsWith("video")) {
                      setVideo(result);
                      setImage("");
                    } else {
                      setImage(result);
                      setVideo("");
                    }
                    setMediaNote(file.type.startsWith("video") ? "Video added." : "Picture added.");
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            {mediaNote ? <p className="text-sm text-muted">{mediaNote}</p> : null}
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What is it?" className="min-h-11 rounded-xl border border-line bg-white px-3" />
            <input value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="Short note" className="min-h-11 rounded-xl border border-line bg-white px-3" />
            <button type="submit" className="min-h-11 rounded-xl border border-primary bg-white px-3 text-sm font-medium text-primary">Save listing</button>
          </form>
        ) : null}
        {shown.length === 0 ? <p className="text-sm text-muted">Nothing in that mix. Loosen a filter. Something will turn up.</p> : null}
        {shown.map((row) => {
          const business = businesses.find((item) => item.id === row.businessId);
          const described = presentListing(row);
          const ago = listedAgo(row);
          return (
            <div key={row.id}>
            <Link to="/listing/$id" params={{ id: row.id }} search={{ from: keep }} className="block overflow-hidden rounded-2xl border border-line bg-white shadow-[0_10px_24px_-18px_rgba(16,40,32,0.75)]">
              {<span className="block overflow-hidden">
                  <img loading="lazy" decoding="async" src={described.image || pictureFor(`${row.title} ${row.category || ""}`, "listing")} alt="" className="h-44 w-full object-cover" />
                </span>}
              <span className="block px-3 py-3">
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="text-xs tracking-wide text-muted">
                      <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">{described.category}</span>
                    </span>
                    <span className="mt-1 block break-words font-medium">{row.title}</span>
                  </span>
                  <span className="shrink-0 font-semibold text-primary">{described.priceLabel || "Ask"}</span>
                </span>
                <span className="mt-1 block text-sm text-muted">
                  {described.subcategory} · {listingTypeLabel(described.listingType)}
                  {business ? ` · ${business.name}` : ""}
                </span>
                {ago ? <span className="mt-1 block text-xs font-medium text-primary">Listed {ago}</span> : null}
                {row.status === "pending" ? <span className="mt-1 block text-xs text-muted">Waiting for a person to publish this.</span> : null}
              </span>
            </Link>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
