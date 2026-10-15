import { DEMO_OWNER_EMAIL, type Listing } from "@/lib/common/model";

export const MARKET_CATEGORIES = [
  { name: "Cars & Vehicles", items: ["Cars", "Motorbikes", "Vans", "Bicycles", "Car parts & accessories", "Other vehicles"] },
  { name: "Home & Garden", items: ["Furniture", "Home décor", "Garden & outdoor", "DIY & tools", "Appliances", "Kitchen & dining", "Home improvement"] },
  { name: "Electronics", items: ["Phones & tablets", "Computers & laptops", "TVs & audio", "Cameras", "Gaming", "Smart home"] },
  { name: "Fashion & Clothing", items: ["Women's clothing", "Men's clothing", "Children's clothing", "Shoes", "Bags & accessories", "Jewellery & watches"] },
  { name: "Baby & Kids", items: ["Baby equipment", "Toys & games", "Prams & pushchairs", "Children's furniture", "School items"] },
  { name: "Sports & Leisure", items: ["Gym & fitness", "Cycling", "Camping & hiking", "Fishing", "Golf", "Sports equipment", "Hobbies & collectibles"] },
  { name: "Jobs & Services", items: ["Tradespeople", "Cleaning", "Gardening", "Handyman", "Tutoring", "Beauty & personal care", "Professional services", "Temporary & casual work"] },
  { name: "Pets & Animals", items: ["Dogs", "Cats", "Small animals", "Pet supplies", "Pet services"] },
  { name: "Business & Commercial", items: ["Business equipment", "Office furniture", "Commercial property", "Catering equipment", "Trade supplies", "Business services"] },
  { name: "Property", items: ["Property for sale", "Property to rent", "Rooms & flatshares", "Parking & garages", "Holiday lets"] },
  { name: "Entertainment & Events", items: ["Tickets", "Concerts", "Theatre", "Local events", "Parties & celebrations", "Classes & workshops"] },
  { name: "Collectibles & Antiques", items: ["Antiques", "Art", "Coins & stamps", "Memorabilia", "Vintage", "Collectibles"] },
  { name: "Free & Giveaways", items: ["Free furniture", "Free household items", "Free building materials", "Free plants", "Other free items"] },
  { name: "Food & Drink", items: ["Homemade food", "Cakes & baking", "Local produce", "Preserves", "Catering"] },
  { name: "Other", items: ["Miscellaneous", "Wanted items", "Lost & found"] },
] as const;

export type MarketCategory = (typeof MARKET_CATEGORIES)[number]["name"];

export const LISTING_TYPES = [
  { id: "sale", label: "For Sale" },
  { id: "wanted", label: "Wanted" },
  { id: "free", label: "Free" },
  { id: "swap", label: "Swap" },
  { id: "service", label: "Service" },
  { id: "rental", label: "Rental" },
] as const;

export const CONDITIONS = [
  { id: "new", label: "New" },
  { id: "like-new", label: "Like New" },
  { id: "good", label: "Good" },
  { id: "used", label: "Used" },
  { id: "parts", label: "For Parts" },
] as const;

export const PRICE_BANDS = [
  { id: "free", label: "Free" },
  { id: "under-10", label: "Under £10" },
  { id: "10-50", label: "£10–£50" },
  { id: "50-100", label: "£50–£100" },
  { id: "100-500", label: "£100–£500" },
  { id: "500-plus", label: "£500+" },
] as const;

export type ListingTypeId = (typeof LISTING_TYPES)[number]["id"];
export type ConditionId = (typeof CONDITIONS)[number]["id"];
export type PriceBandId = (typeof PRICE_BANDS)[number]["id"];

export function subcategories(category: string) {
  return MARKET_CATEGORIES.find((row) => row.name === category)?.items ?? [];
}

export function listingTypeLabel(id: string) {
  return LISTING_TYPES.find((row) => row.id === id)?.label ?? id;
}

export function conditionLabel(id: string) {
  return CONDITIONS.find((row) => row.id === id)?.label ?? "";
}

export function bandForAmount(raw: string) {
  const text = raw.trim();
  if (!text) return { priceBand: "" as PriceBandId | "", priceLabel: "" };
  if (/free/i.test(text)) return { priceBand: "free" as const, priceLabel: "Free" };
  const amount = Number(text.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(amount) || text.replace(/[^0-9.]/g, "") === "") return { priceBand: "" as const, priceLabel: text };
  const priceLabel = `£${Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2)}`;
  const priceBand: PriceBandId = amount <= 0 ? "free" : amount < 10 ? "under-10" : amount <= 50 ? "10-50" : amount <= 100 ? "50-100" : amount <= 500 ? "100-500" : "500-plus";
  return { priceBand, priceLabel };
}

const SAMPLE_MEDIA: Record<string, { image?: string; video?: string }> = {
  "mkt_dcd88a55-9fdf-adbf-5d09-674b7a0ff65e": { image: "/market/van.jpg", video: "/market/van.mp4" },
  "mkt_78f28985-9313-8b69-f347-e99158d4a792": { image: "/market/table.jpg" },
  "mkt_3bbb668b-852b-0e5c-a16f-7549f6029d8c": { image: "/market/tablet.jpg" },
  "mkt_993e5dd1-01b0-5cbc-1d21-05944d57ab39": { image: "/market/coat.jpg" },
  "mkt_fcbba62a-78d4-9b76-e549-c4625584180c": { image: "/market/pram.jpg" },
  "mkt_405fcd78-2762-1b88-76fc-b1d53f726390": { image: "/market/bike.jpg" },
  "mkt_36ab6092-911d-5cdf-2ed1-88a14ea5ae7a": { image: "/places/buddys-deli.jpg" },
  "mkt_612a0829-3531-b3a1-171b-f0195232aa10": { image: "/specials/deli.jpg" },
  "mkt_0dece908-a601-0c2c-3d07-193e8da1e398": { image: "/places/brew.jpg" },
  "mkt_a303d98b-72bd-a021-a31f-e6d7b2843a5d": { image: "/news/kennington.jpg" },
  "mkt_9634349a-97fe-9f59-8fc1-a1ee6ed0f014": { image: "/news/theatre.jpg" },
  "mkt_40eca5c4-4976-f890-a247-2d08a3a33315": { image: "/news/oval.jpg" },
  "mkt_d0e6d735-8f93-be8c-5b64-345ea6ecc0eb": { image: "/specials/coffee.jpg" },
  "mkt_31c243d9-11ce-042f-4cfb-d11c8ee479ba": { image: "/market/cake.jpg" },
};

export function presentListing(row: Listing) {
  const media = SAMPLE_MEDIA[row.id];
  return {
    ...describeListing(row),
    image: row.image || media?.image || "",
    video: row.video || media?.video || "",
  };
}

export function priceBandLabel(id: string) {
  return PRICE_BANDS.find((row) => row.id === id)?.label ?? "";
}

type Listed = Listing & {
  category?: string;
  subcategory?: string;
  listingType?: ListingTypeId;
  condition?: ConditionId | "";
  priceBand?: PriceBandId | "";
  priceLabel?: string;
};

export function describeListing(row: Listed) {
  const category = row.category || (row.kind === "job" ? "Jobs & Services" : "Business & Commercial");
  const subcategory = row.subcategory || (row.kind === "job" ? "Temporary & casual work" : "Business equipment");
  const listingType = row.listingType || (row.kind === "job" ? "service" : "sale");
  return {
    category,
    subcategory,
    listingType,
    condition: row.condition || "",
    priceBand: row.priceBand || "",
    priceLabel: row.priceLabel || priceBandLabel(row.priceBand || ""),
  };
}

export const SEED_LISTINGS: Listing[] = [
  { id: "mkt_dcd88a55-9fdf-adbf-5d09-674b7a0ff65e", businessId: "biz_6f7f0e5e-f5e1-bcb9-11ed-aaa7777435d5", kind: "equipment", category: "Cars & Vehicles", subcategory: "Vans", listingType: "sale", condition: "good", priceBand: "500-plus", priceLabel: "£4,200", title: "Small catering van", detail: "Sample listing. The Brew & Barrel has not advertised this van.", status: "published" },
  { id: "mkt_78f28985-9313-8b69-f347-e99158d4a792", businessId: "biz_f16ac2ca-1bce-371e-4ec7-35ed623bc135", kind: "equipment", category: "Home & Garden", subcategory: "Furniture", listingType: "sale", condition: "used", priceBand: "50-100", priceLabel: "£80", title: "Cafe table and two chairs", detail: "Sample listing. The Common has not advertised this furniture.", status: "published" },
  { id: "mkt_3bbb668b-852b-0e5c-a16f-7549f6029d8c", businessId: "", kind: "equipment", category: "Electronics", subcategory: "Phones & tablets", listingType: "sale", condition: "like-new", priceBand: "100-500", priceLabel: "£180", title: "Tablet, spare", detail: "Sample listing for the electronics category. It is not a real sale.", status: "published" },
  { id: "mkt_993e5dd1-01b0-5cbc-1d21-05944d57ab39", businessId: "", kind: "equipment", category: "Fashion & Clothing", subcategory: "Women's clothing", listingType: "sale", condition: "good", priceBand: "10-50", priceLabel: "£25", title: "Wool coat", detail: "Sample listing for the fashion category. It is not a real sale.", status: "published" },
  { id: "mkt_fcbba62a-78d4-9b76-e549-c4625584180c", businessId: "", kind: "equipment", category: "Baby & Kids", subcategory: "Prams & pushchairs", listingType: "sale", condition: "good", priceBand: "100-500", priceLabel: "£120", title: "Pushchair", detail: "Sample listing for the baby category. It is not a real sale.", status: "published" },
  { id: "mkt_405fcd78-2762-1b88-76fc-b1d53f726390", businessId: "", kind: "equipment", category: "Sports & Leisure", subcategory: "Cycling", listingType: "swap", condition: "used", priceBand: "100-500", priceLabel: "Swap", title: "Hybrid bike, open to a swap", detail: "Sample listing. Nothing is exchanged in this preview.", status: "published" },
  { id: "mkt_36ab6092-911d-5cdf-2ed1-88a14ea5ae7a", businessId: "biz_536c0361-26a6-fac0-d864-fd72ce9e95b0", kind: "job", category: "Jobs & Services", subcategory: "Temporary & casual work", listingType: "service", condition: "", priceBand: "", priceLabel: "Ask", title: "Saturday counter cover", detail: "Sample job listing. Buddy's Deli has not advertised this shift.", status: "published" },
  { id: "mkt_612a0829-3531-b3a1-171b-f0195232aa10", businessId: "", kind: "equipment", category: "Pets & Animals", subcategory: "Pet supplies", listingType: "sale", condition: "new", priceBand: "under-10", priceLabel: "£8", title: "Dog lead, unused", detail: "Sample listing for the pets category. It is not a real sale.", status: "published" },
  { id: "mkt_0dece908-a601-0c2c-3d07-193e8da1e398", businessId: "biz_6f7f0e5e-f5e1-bcb9-11ed-aaa7777435d5", kind: "equipment", category: "Business & Commercial", subcategory: "Catering equipment", listingType: "sale", condition: "good", priceBand: "500-plus", priceLabel: "£600", title: "Countertop oven", detail: "Sample listing. The Brew & Barrel has not advertised this oven.", status: "published" },
  { id: "mkt_a303d98b-72bd-a021-a31f-e6d7b2843a5d", businessId: "", kind: "equipment", category: "Property", subcategory: "Rooms & flatshares", listingType: "rental", condition: "", priceBand: "500-plus", priceLabel: "£800 a month", title: "Room near the common", detail: "Sample listing. This room is not really to let.", status: "published" },
  { id: "mkt_9634349a-97fe-9f59-8fc1-a1ee6ed0f014", businessId: "", kind: "equipment", category: "Entertainment & Events", subcategory: "Tickets", listingType: "sale", condition: "new", priceBand: "10-50", priceLabel: "£20", title: "Spare local ticket", detail: "Sample listing. No ticket is actually for sale.", status: "published" },
  { id: "mkt_40eca5c4-4976-f890-a247-2d08a3a33315", businessId: "", kind: "equipment", category: "Collectibles & Antiques", subcategory: "Art", listingType: "sale", condition: "good", priceBand: "50-100", priceLabel: "£60", title: "Framed local print", detail: "Sample listing for the collectibles category. It is not a real sale.", status: "published" },
  { id: "mkt_d0e6d735-8f93-be8c-5b64-345ea6ecc0eb", businessId: "biz_6cc32cb9-e26f-5610-0e10-beaf8623c2c5", kind: "equipment", category: "Free & Giveaways", subcategory: "Free plants", listingType: "free", condition: "good", priceBand: "free", priceLabel: "Free", title: "Herb pots from the counter", detail: "Sample giveaway. Buddy's Coffee Shop has not offered these.", status: "published" },
  { id: "mkt_31c243d9-11ce-042f-4cfb-d11c8ee479ba", businessId: "biz_6cc32cb9-e26f-5610-0e10-beaf8623c2c5", kind: "equipment", category: "Food & Drink", subcategory: "Cakes & baking", listingType: "sale", condition: "new", priceBand: "10-50", priceLabel: "£18", title: "Celebration cake, to order", detail: "Sample listing. Buddy's Coffee Shop has not offered this cake.", status: "published" },
  { id: "mkt_45ef3bc4-0579-4a51-57e9-2766cc0c3ecb", businessId: "biz_f4393427-4b76-e6d7-54b8-870177dfa5b6", kind: "job", category: "Jobs & Services", subcategory: "Beauty & personal care", listingType: "service", condition: "", priceBand: "", priceLabel: "Ask", image: "/places/beu.jpg", title: "Stylist wanted", detail: "BE U Studio is looking for a stylist to join the team on The Polygon. Send a Word or PDF CV from this listing. This preview does not hire anyone.", status: "published" },
  { id: "mkt_b08dc107-2fcb-76c7-b3b7-d747229570fc", businessId: "biz_536c0361-26a6-fac0-d864-fd72ce9e95b0", kind: "equipment", category: "Business & Commercial", subcategory: "Catering equipment", listingType: "sale", condition: "good", priceBand: "100-500", priceLabel: "£350", image: "/places/buddys-deli.jpg", title: "Bakery mixer", detail: "A mixer from the Buddy's bakery, listed so it appears under Other on the deli page. This preview does not take payment.", status: "published" },
  { id: "mkt_1f31a342-5070-4fb9-9f91-0473598c6d20", businessId: "", kind: "equipment", category: "Other", subcategory: "Wanted items", listingType: "wanted", condition: "", priceBand: "", priceLabel: "Wanted", title: "Wanted: a local noticeboard", detail: "Sample wanted notice. Nobody is actually looking for this.", status: "published" },
];

export function listedAt(row: { id: string; publishedAt?: string }) {
  if (row.publishedAt) {
    const time = new Date(row.publishedAt).getTime();
    if (Number.isFinite(time)) return time;
  }
  const hoursAgo = LISTED_HOURS[row.id];
  return hoursAgo == null ? 0 : Date.now() - hoursAgo * 3600000;
}

export function listedAgo(row: { id: string; publishedAt?: string }) {
  const then = listedAt(row);
  if (!then) return "";
  const minutes = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  const months = Math.max(1, Math.round(days / 30));
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

const LISTED_HOURS: Record<string, number> = {
  "mkt_dcd88a55-9fdf-adbf-5d09-674b7a0ff65e": 2,
  "mkt_78f28985-9313-8b69-f347-e99158d4a792": 5,
  "mkt_3bbb668b-852b-0e5c-a16f-7549f6029d8c": 26,
  "mkt_993e5dd1-01b0-5cbc-1d21-05944d57ab39": 72,
  "mkt_fcbba62a-78d4-9b76-e549-c4625584180c": 140,
  "mkt_405fcd78-2762-1b88-76fc-b1d53f726390": 30,
  "mkt_36ab6092-911d-5cdf-2ed1-88a14ea5ae7a": 4,
  "mkt_612a0829-3531-b3a1-171b-f0195232aa10": 0.5,
  "mkt_0dece908-a601-0c2c-3d07-193e8da1e398": 200,
  "mkt_a303d98b-72bd-a021-a31f-e6d7b2843a5d": 300,
  "mkt_9634349a-97fe-9f59-8fc1-a1ee6ed0f014": 1,
  "mkt_40eca5c4-4976-f890-a247-2d08a3a33315": 336,
  "mkt_d0e6d735-8f93-be8c-5b64-345ea6ecc0eb": 3,
  "mkt_31c243d9-11ce-042f-4cfb-d11c8ee479ba": 0.75,
  "mkt_45ef3bc4-0579-4a51-57e9-2766cc0c3ecb": 20,
  "mkt_b08dc107-2fcb-76c7-b3b7-d747229570fc": 6,
  "mkt_1f31a342-5070-4fb9-9f91-0473598c6d20": 220,
};

export function visibleListings(stored: Listing[] | null | undefined) {
  const rows = Array.isArray(stored) ? stored.filter((row) => row && row.id) : [];
  const ids = new Set(SEED_LISTINGS.map((row) => row.id));
  return [...SEED_LISTINGS.map((row) => ({ ...row, ownerEmail: DEMO_OWNER_EMAIL })), ...rows.filter((row) => !ids.has(row.id))];
}
