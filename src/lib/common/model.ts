import { lookupPostcode } from "./boundaries";
import { SUPER_EMAIL } from "./staff";

export type Status = "pending" | "changes_requested" | "published" | "refused" | "suspended";
export type AppealState = "none" | "opened" | "waiting" | "upheld" | "substituted" | "sent_back" | "lapsed";

export type Business = {
  id: string;
  name: string;
  category: string;
  trade: "service" | "hospitality";
  shelf: "menu" | "services" | "products";
  address: string;
  postcode: string;
  lat: number;
  lng: number;
  phone: string;
  email: string;
  hours: string;
  specialHours?: { label: string; from: string; to: string; opens: string; closes: string; closed?: boolean }[];
  about: string;
  website: string;
  services: string[];
  menu: { name: string; price: string; detail: string; service: string }[];
  menuNote: string;
  access: "not_stated";
  proof: string;
  status: Status;
  reason: string;
  appeal: AppealState;
  ownerName?: string;
  ownerEmail?: string;
  staff?: { email: string; name: string; role: "owner" | "staff"; duty?: string }[];
  claimCode?: string;
  trialEnds?: string;
  revision?: { about?: string; phone?: string; address?: string };
  paused?: boolean;
  views: number;
  clicks: number;
  directions: number;
  shares?: number;
  cover?: string;
  logo?: string;
  gallery?: string[];
  video?: string;
  hero?: string;
  social?: { instagram?: string; facebook?: string; tiktok?: string; x?: string };
  reel?: string;
  bookings?: boolean;
  appointments?: boolean;
  chatOn?: boolean;
};

export type Offer = {
  id: string;
  businessId: string;
  title: string;
  detail: string;
  price?: string;
  image?: string;
  upload?: string;
  status: Status;
};

export const EVENT_KINDS = ["Food", "Music", "Arts", "Community", "Family", "Markets"] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

export type LocalEvent = {
  id: string;
  businessId: string;
  kind: EventKind;
  title: string;
  when: string;
  date: string;
  time: string;
  place: string;
  address: string;
  neighbourhood: string;
  detail: string;
  website: string;
  tickets: string;
  ticketPrice?: number;
  image?: string;
  video?: string;
  sample?: boolean;
  phone?: string;
  email?: string;
  username?: string;
  passwordHash?: string;
  postcode?: string;
  capacity: number;
  status: Status;
  reason: string;
  ownerName?: string;
  ownerEmail?: string;
  staff?: { email: string; name: string; role: "owner" | "staff"; duty?: string }[];
};

export type Reservation = {
  id: string;
  eventId: string;
  accountName: string;
  code: string;
  scannedAt: string | null;
};

export type Booking = {
  id: string;
  businessId: string;
  kind: "service" | "table";
  accountName: string;
  party: string;
  when: string;
  code: string;
};

export type Listing = {
  id: string;
  businessId: string;
  kind: "job" | "equipment";
  title: string;
  detail: string;
  status: Status;
  category?: string;
  subcategory?: string;
  listingType?: "sale" | "wanted" | "free" | "swap" | "service" | "rental";
  condition?: "new" | "like-new" | "good" | "used" | "parts" | "";
  priceBand?: "free" | "under-10" | "10-50" | "50-100" | "100-500" | "500-plus" | "";
  priceLabel?: string;
  image?: string;
  video?: string;
  publishedAt?: string;
  ownerName?: string;
  ownerEmail?: string;
  staff?: { email: string; name: string; role: "owner" | "staff"; duty?: string }[];
};

export type CvApplication = {
  id: string;
  listingId: string;
  from: string;
  fileName: string;
  at: string;
};

export type ListingMessage = {
  id: string;
  listingId: string;
  from: string;
  body: string;
  reply: string;
  at?: string;
  read?: boolean;
};

export type Enquiry = {
  id: string;
  businessId: string;
  eventId?: string;
  from: string;
  body: string;
  reply: string;
  at?: string;
  read?: boolean;
};

export type Incident = {
  id: string;
  at: string;
  neighbourhood: string;
  service: "police" | "fire";
  description: string;
  anonymous: boolean;
  name: string;
  imageName: string;
};

export type Report = {
  id: string;
  target: string;
  from: string;
  body: string;
  status: "open" | "closed";
  outcome: string;
  category?: string;
  severity?: "low" | "medium" | "high";
  assigned?: string;
  notes?: string;
  updatedAt?: string;
  escalated?: boolean;
  ackAt?: string;
  finalResponseAt?: string;
};

export type NewsItem = {
  id: string;
  source: string;
  title: string;
  excerpt: string;
  lead?: string;
  article?: string[];
  href: string;
  neighbourhood: string;
  image?: string;
  posted?: string;
  author?: string;
  phone?: string;
  email?: string;
  views?: number;
  status: Status;
  reason: string;
};

export type Indemnity = {
  id: string;
  businessId: string;
  accountName: string;
  service: string;
  when: string;
  fullName: string;
  dob: string;
  mobile: string;
  email: string;
  treatments: string;
  skinHistory: string;
  medication: string;
  medical: string;
  additionalInfo: string;
  photoConsent: string;
  marketing: boolean;
  clientDate: string;
  at: string;
};

export type Rating = {
  businessId: string;
  accountName: string;
  stars: number;
};

export const ACCOUNT_KINDS = [
  "resident",
  "business",
  "council",
  "council_partner",
  "organiser",
  "club",
  "author",
  "charity",
  "journalist",
] as const;

export type AccountKind = (typeof ACCOUNT_KINDS)[number];

export type Account = {
  id?: string;
  name: string;
  over18: true;
  ageConfirmedAt?: string;
  kind?: AccountKind;
  roles?: AccountKind[];
  surname?: string;
  photo?: string;
  email?: string;
  username?: string;
  passwordHash?: string;
  organisation?: string;
  roleTitle?: string;
  neighbourhood?: string;
  note?: string;
  membership?: "viewer" | "card";
  cardLast4?: string;
  agreement?: boolean;
  approved?: boolean;
};

export type Audit = {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  reason: string;
};

const SECRET = "stage0-private";

export function sign(id: string) {
  let hash = 0;
  const raw = `${id}|${SECRET}`;
  for (const char of raw) hash = (Math.imul(hash, 33) + char.charCodeAt(0)) >>> 0;
  return hash.toString(16);
}

export function ticketCode(id: string) {
  return `TC.${id}.${sign(id)}`;
}

export function readTicket(code: string) {
  const parts = code.trim().split(".");
  if (parts.length !== 3 || parts[0] !== "TC") return null;
  const id = parts[1];
  if (!id || parts[2] !== sign(id)) return null;
  return id;
}

export function ownsRecord(
  row: { ownerName?: string; ownerEmail?: string },
  account: { name: string; email?: string } | null | undefined,
) {
  if (!account) return false;
  const email = account.email?.trim().toLowerCase();
  if (row.ownerEmail && email && row.ownerEmail === email) return true;
  if (email && "staff" in row && Array.isArray((row as { staff?: { email: string }[] }).staff) && (row as { staff?: { email: string }[] }).staff?.some((person) => person.email === email)) return true;
  return Boolean(row.ownerName && row.ownerName === account.name);
}

export const DEMO_OWNER_EMAIL = SUPER_EMAIL;

export function areaFor(postcode: string) {
  return lookupPostcode(postcode);
}

export const SEED_BUSINESSES: Business[] = [
  {
    id: "biz_f4393427-4b76-e6d7-54b8-870177dfa5b6",
    name: "BE U Studio",
    category: "Beauty studio",
    trade: "service",
    shelf: "services",
    address: "18 The Polygon, Clapham Old Town",
    postcode: "SW4 0JG",
    lat: 51.4635,
    lng: -0.1414,
    phone: "",
    email: "",
    hours: "Mon 11:00–20:00. Tue–Fri 8:00–20:00. Sat 8:00–18:00. Closed Sunday.",
    about: "A calm beauty studio on The Polygon, in the middle of Clapham Old Town. Sit down for a face treatment, nails, a massage, hair removal or medical aesthetics. The prices here are the public from-prices on Treatwell, and the studio can change them.",
    website: "https://www.treatwell.co.uk/place/be-u-studio-clapham/",
    services: ["Face", "Nails", "Massage", "Hair removal", "Medical aesthetics"],
    menu: [
      { name: "Lash lift and tint", price: "from £55.25", detail: "Treatwell. A patch test is required.", service: "Face" },
      { name: "Shellac manicure and removal", price: "from £32", detail: "Treatwell.", service: "Nails" },
      { name: "Brazilian wax", price: "from £27.20", detail: "Treatwell.", service: "Hair removal" },
      { name: "Microneedling", price: "from £112.50", detail: "Treatwell. About 35 minutes.", service: "Medical aesthetics" },
    ],
    menuNote: "Taken from the public Treatwell page. This preview does not book or take payment.",
    access: "not_stated",
    proof: "Not checked in this preview.",
    status: "published",
    reason: "",
    appeal: "none",
    views: 128,
    clicks: 36,
    directions: 14,
  },
  {
    id: "biz_536c0361-26a6-fac0-d864-fd72ce9e95b0",
    name: "Buddy's Deli",
    category: "Deli",
    trade: "hospitality",
    shelf: "menu",
    address: "1 The Polygon, Clapham",
    postcode: "SW4 0JG",
    lat: 51.4633,
    lng: -0.1412,
    phone: "",
    email: "",
    hours: "Mon–Tue 7:00–16:00. Wed–Thu 7:00–22:00. Fri–Sat 7:00–22:30. Sun 8:00–17:00.",
    about: "A neighbourhood deli on The Polygon, built for a proper lunch between the common and the old town. Sandwiches, salads and coffee, with the prices taken from the public EatClub menu.",
    website: "https://eatclub.co.uk/venue/buddys-deli",
    services: ["Sandwiches", "Salads", "Coffee"],
    menu: [
      { name: "Chipotle chicken", price: "£10.95", detail: "Ciabatta, chilli mayo, coriander pesto, peppers, pickled cucumber and cheddar.", service: "Sandwiches" },
      { name: "Pastrami and mozzarella", price: "£9.50", detail: "Focaccia, mustard mayo, tomato, gherkins and rocket.", service: "Sandwiches" },
      { name: "Prosciutto and burrata", price: "£9.50", detail: "Focaccia, coriander pesto, tomatoes and rocket.", service: "Sandwiches" },
      { name: "Broccoli slaw salad", price: "On the menu", detail: "Broccoli, red onion, cranberries and sunflower seeds. EatClub did not list a price.", service: "Salads" },
      { name: "Cappuccino, cortado, turmeric latte", price: "On the menu", detail: "EatClub named these drinks and did not list a price.", service: "Coffee" },
    ],
    menuNote: "From the public EatClub menu. No phone or email was published there. This preview does not take an order.",
    access: "not_stated",
    proof: "Not checked in this preview.",
    status: "published",
    reason: "",
    appeal: "none",
    views: 86,
    clicks: 22,
    directions: 11,
  },
  {
    id: "biz_6cc32cb9-e26f-5610-0e10-beaf8623c2c5",
    name: "Buddy's Coffee Shop",
    category: "Coffee shop",
    trade: "hospitality",
    shelf: "menu",
    address: "26 The Pavement, Clapham Old Town",
    postcode: "SW4 0JA",
    lat: 51.46242,
    lng: -0.1401,
    phone: "",
    email: "",
    hours: "Wed–Fri 7:00–16:00. Sat–Sun 8:00–16:00. Monday and Tuesday were not on the public post.",
    about: "The Buddy's bakery and coffee shop on The Pavement, a few steps from the common. Specialty coffee, matcha and hot chocolate, plus the cinnamon buns, cookies and bread baked for the deli as well as sold at the counter.",
    website: "https://www.instagram.com/buddys_deli_bakery/",
    services: ["Specialty coffee", "Matcha", "Hot chocolate", "Bakery"],
    menu: [
      { name: "Specialty coffee", price: "On the counter", detail: "No public price list was found.", service: "Specialty coffee" },
      { name: "Matcha", price: "On the counter", detail: "Named in the public opening post. No price was published.", service: "Matcha" },
      { name: "Hot chocolate", price: "On the counter", detail: "Named in the public opening post. No price was published.", service: "Hot chocolate" },
      { name: "Cinnamon buns, cookies and brownies", price: "On the counter", detail: "Named in the public opening post.", service: "Bakery" },
      { name: "Sourdough, soda bread and focaccia", price: "On the counter", detail: "Baked for the deli as well as sold here.", service: "Bakery" },
    ],
    menuNote: "Hours and the bake list are from a public opening post. No phone, email or price list was published. Wed–Fri 7:00–16:00. Sat–Sun 8:00–16:00.",
    access: "not_stated",
    proof: "Not checked in this preview.",
    status: "published",
    reason: "",
    appeal: "none",
    views: 64,
    clicks: 18,
    directions: 9,
  },
  {
    id: "biz_6f7f0e5e-f5e1-bcb9-11ed-aaa7777435d5",
    name: "The Brew & Barrel",
    category: "Espresso, brunch and cocktails",
    trade: "hospitality",
    shelf: "menu",
    address: "36A Old Town, Clapham",
    postcode: "SW4 0LB",
    lat: 51.46415,
    lng: -0.14174,
    phone: "07872 317846",
    email: "admin@brewandbarrel.co.uk",
    hours: "Mon–Wed 7:00–22:00. Thu–Sat 7:00–00:30. Sun 8:00–22:00. As written on brewandbarrelsw4.com.",
    about: "A family-run espresso bar, brunch room and cocktail spot in Clapham Old Town, with a sister cafe on Northcote Road. Start with coffee, stay for a late plate, and let the room turn towards the evening.",
    website: "https://www.brewandbarrelsw4.com/",
    services: ["Specialty coffee", "Brunch", "Cocktails", "Group bookings"],
    menu: [
      { name: "Smashed avocado and poached eggs", price: "£9.50", detail: "Feta and chilli on sourdough. Brunch menu.", service: "Brunch" },
      { name: "Full English", price: "£14.50", detail: "Double up listed at £6 extra.", service: "Brunch" },
      { name: "Shakshuka", price: "£14", detail: "Add chorizo £3.50.", service: "Brunch" },
      { name: "French toast", price: "£10", detail: "Strawberry, berries and mint.", service: "Brunch" },
      { name: "Banoffee pancakes", price: "£11", detail: "Stack of three.", service: "Brunch" },
      { name: "Latte", price: "£3.20", detail: "Espresso £2.70. Cappuccino £3.40.", service: "Specialty coffee" },
      { name: "Bloody Mary", price: "£8", detail: "On the same published brunch menu.", service: "Cocktails" },
      { name: "Mimosa", price: "£8", detail: "Listed 11:00–16:00 on that menu.", service: "Cocktails" },
      { name: "Group booking", price: "Ask by phone", detail: "Call or text 07872 317846. No set price was published.", service: "Group bookings" },
    ],
    menuNote: "Prices are from the brunch menu published on DesignMyNight in February 2024. A newer picture menu is on brewandbarrelsw4.com, so ask in the cafe before you rely on a price. This preview does not hold a table.",
    access: "not_stated",
    proof: "Not checked in this preview.",
    status: "published",
    reason: "",
    appeal: "none",
    views: 140,
    clicks: 41,
    directions: 19,
  },
  ...moreBusinesses(),
];

function moreBusinesses(): Business[] {
  const sample = "A public listing for this preview, so the neighbourhood is not empty. Not a member, and today's hours were not checked.";
  const row = (
    id: string,
    name: string,
    category: string,
    trade: Business["trade"],
    shelf: Business["shelf"],
    address: string,
    postcode: string,
    lat: number,
    lng: number,
    services: string[],
    phone = "",
  ): Business => ({
    id,
    name,
    category,
    trade,
    shelf,
    address,
    postcode,
    lat,
    lng,
    phone,
    email: "",
    hours: "Check with them before you go.",
    about: `${name} is on the map in this neighbourhood. ${sample}`,
    website: "",
    services,
    menu: services.map((service) => ({ name: service, price: "Ask in person", detail: "No public price was checked for this preview.", service })),
    menuNote: sample,
    access: "not_stated",
    proof: "Not checked in this preview.",
    status: "published",
    reason: "",
    appeal: "none",
    views: 18,
    clicks: 4,
    directions: 2,
  });
  const rows = [
    row("biz_6ce08156-3437-beff-0cf3-b3868d6ac1ef", "Franco Manca", "Pizza", "hospitality", "menu", "4 Market Row, Brixton", "SW9 8LD", 51.4618, -0.1148, ["Pizza", "Salads"]),
    row("biz_9e9b29ea-0f6d-2f06-652c-f7adbf17bb37", "Honest Burgers", "Burgers", "hospitality", "menu", "Unit 12, Brixton Village", "SW9 8PR", 51.4621, -0.1142, ["Burgers", "Sides"]),
    row("biz_dacbe44e-aad2-3d95-3618-215ca5afcbfc", "Pop Brixton", "Food yard", "hospitality", "menu", "49 Brixton Station Road", "SW9 8PQ", 51.4626, -0.1134, ["Street food", "Drinks"]),
    row("biz_3b0fa917-fb50-0d72-53dd-abbf1126c98a", "Green Cactus Coffee", "Cafe", "hospitality", "menu", "241–243 Streatham High Road", "SW16 6EN", 51.427, -0.131, ["Coffee", "Lunch"], "07553 767918"),
    row("biz_f4fae421-6568-79a1-c82f-eb7b8949893d", "Brickwood", "Cafe", "hospitality", "menu", "292 Streatham High Road", "SW16 6HE", 51.426, -0.13, ["Coffee", "Brunch"]),
    row("biz_c41ff187-41bd-20b0-fa30-596adaffa03a", "Be Wyld", "Cafe", "hospitality", "menu", "28 Streatham High Road", "SW16 1DB", 51.435, -0.126, ["Coffee", "Cake"]),
    row("biz_83967a12-0575-58c3-86a9-c7597ac77bca", "Brunswick House", "Restaurant", "hospitality", "menu", "30 Wandsworth Road", "SW8 2LG", 51.4847, -0.1265, ["Dining", "Drinks"]),
    row("biz_287ab180-a89b-a4f9-fac7-7dd799bcfa43", "Bonnington Cafe", "Cafe", "hospitality", "menu", "11 Vauxhall Grove", "SW8 1TD", 51.4855, -0.1205, ["Vegetarian", "Lunch"]),
    row("biz_4f0a0601-d726-122e-cde8-dd061e355516", "The Fentiman Arms", "Pub", "hospitality", "menu", "64 Fentiman Road", "SW8 1LA", 51.4828, -0.119, ["Pub food", "Drinks"]),
    row("biz_8ff52c91-ed7d-5094-40aa-7fbf04ad60ad", "Taro", "Japanese", "hospitality", "menu", "412 Kennington Road", "SE11 4PT", 51.486, -0.109, ["Ramen", "Sushi"]),
    row("biz_b8772f81-317f-47a8-9056-ebb998d6735e", "The Tommyfield", "Pub", "hospitality", "menu", "185 Kennington Lane", "SE11 4EZ", 51.4875, -0.111, ["Pub food", "Drinks"]),
    row("biz_8bb0d208-5c90-e668-3418-e2c769ee0cfb", "The Black Prince", "Pub", "hospitality", "menu", "6 Black Prince Road", "SE11 6HS", 51.4905, -0.114, ["Pub food", "Drinks"]),
    row("biz_e306f733-f33f-f592-e53f-82db18629f59", "The Old Vic", "Theatre", "service", "services", "103 The Cut", "SE1 8NB", 51.502, -0.109, ["Theatre", "Bar"]),
    row("biz_c14be730-7be5-23ca-135f-ccd9dd3c1b93", "Scooter Caffe", "Cafe", "hospitality", "menu", "132 Lower Marsh", "SE1 7AE", 51.501, -0.112, ["Coffee", "Cake"]),
    row("biz_8e22f3eb-f77a-f5a5-9d21-17530b7d8148", "The Wellington", "Pub", "hospitality", "menu", "81 Waterloo Road", "SE1 8UD", 51.503, -0.113, ["Pub food", "Drinks"]),
    row("biz_ad05996c-b450-10bf-c8bc-8d46493b8122", "Mimosa", "Restaurant", "hospitality", "menu", "16 Half Moon Lane", "SE24 9HU", 51.455, -0.099, ["Dining", "Wine"]),
    row("biz_8829e048-69ab-1ace-de45-f929b8ea2c5f", "The Lido Cafe", "Cafe", "hospitality", "menu", "Brockwell Lido, Dulwich Road", "SE24 0PA", 51.4535, -0.106, ["Cafe", "Lunch"]),
    row("biz_9a40af47-d739-e55a-bdfd-e291f8dc2558", "The Commercial", "Pub", "hospitality", "menu", "210–212 Railton Road", "SE24 0JT", 51.453, -0.1025, ["Pub food", "Drinks"]),
    row("biz_142a8ff6-438f-7ffe-16d1-d155ef354ad0", "Tulse Hill Hotel", "Pub", "hospitality", "menu", "150 Norwood Road", "SE24 9AY", 51.445, -0.104, ["Pub food", "Drinks"], "020 8671 7499"),
    row("biz_02677d3d-94d2-f3d1-677c-87d7b953ed98", "Tulse Hill Cafe", "Cafe", "hospitality", "menu", "385 Norwood Road", "SE27 9BQ", 51.44, -0.103, ["Breakfast", "Lunch"], "020 8671 4784"),
    row("biz_2e200253-2828-6dd2-a2ed-507fea89cab5", "Queen of the South", "Pub", "hospitality", "menu", "367 Norwood Road", "SE27 9BQ", 51.44, -0.103, ["Pub food", "Drinks"], "020 4537 2338"),
    row("biz_bbcc3557-f76b-e354-7c98-bf399dfa7f51", "The Hope", "Pub", "hospitality", "menu", "49 Norwood High Street", "SE27 9JS", 51.432, -0.104, ["Pub food", "Sunday roast"]),
    row("biz_4463ea48-1c3b-fc1f-c79c-b0fe617fc23a", "Gipsy Hill Taproom", "Brewery tap", "hospitality", "menu", "Unit 5, 160 Hamilton Road", "SE27 9SF", 51.4285, -0.0889, ["Beer", "Pizza"]),
    row("biz_e6bb5675-3891-bded-52c2-a9f91c3b5eca", "Bricklayers Arms", "Pub", "hospitality", "menu", "1 Hamilton Road", "SE27 9RZ", 51.431, -0.103, ["Drinks", "Pub food"]),
    row("biz_8176ec10-ddc9-83f7-2135-d7f7aad69d6a", "Trinity Arms", "Pub", "hospitality", "menu", "45 Trinity Gardens", "SW9 8DR", 51.473, -0.123, ["Pub food", "Drinks"]),
    row("biz_c0a96110-d9fd-6580-c969-b98d080d9451", "Canton Arms", "Pub", "hospitality", "menu", "177 South Lambeth Road", "SW8 1PX", 51.478, -0.123, ["Pub food", "Sunday roast"]),
    row("biz_052f27d1-4599-1cee-a6b2-126319f95a6b", "Bar Estrela", "Portuguese", "hospitality", "menu", "111–115 South Lambeth Road", "SW8 1UZ", 51.479, -0.123, ["Portuguese", "Wine"]),
    row("biz_349a8261-e1fe-2cdf-d626-f23c1fd7d235", "The Beehive", "Pub", "hospitality", "menu", "51 Durham Street", "SE11 5JA", 51.484, -0.116, ["Pub food", "Drinks"]),
    row("biz_f65d6fa2-9014-0577-e008-69729537f70c", "Duchy Arms", "Pub", "hospitality", "menu", "63 Sancroft Street", "SE11 5NG", 51.491, -0.118, ["Pub food", "Drinks"]),
    row("biz_43858238-397d-5503-8ed7-2e1e321c74a1", "Kennington Lane Cafe", "Cafe", "hospitality", "menu", "383 Kennington Lane", "SE11 5QY", 51.4865, -0.121, ["Breakfast", "Lunch"]),
    row("biz_8cbc459a-0cb8-1468-0542-bb883c56854d", "Craft & Courage", "Pub", "hospitality", "menu", "28 Westow Hill", "SE19 1RX", 51.419, -0.082, ["Drinks", "Food"]),
    row("biz_94d7cd88-aadf-c30b-c4d7-f035fc9c918a", "HopScotch Taprooms", "Taproom", "hospitality", "menu", "50–54 Westow Hill", "SE19 1RX", 51.4192, -0.081, ["Beer", "Food"]),
    row("biz_8c7f875f-ae20-b83e-0460-97834037dc5a", "The Paxton", "Pub", "hospitality", "menu", "52 Gipsy Hill", "SE19 1NL", 51.424, -0.085, ["Pub food", "Drinks"]),
    row("biz_8f43ab5f-dc3e-1e22-553b-c62aca122278", "Affogato", "Cafe", "hospitality", "menu", "1457 London Road", "SW16 4AQ", 51.411, -0.12, ["Coffee", "Cake"]),
    row("biz_c43dbbbb-7c39-4aac-948c-b18b8ce9c044", "Blend", "Cafe", "hospitality", "menu", "1480B London Road", "SW16 4BT", 51.4105, -0.119, ["Coffee", "Breakfast"]),
    row("biz_6cf876e1-55a1-28b4-cbe4-6572443cddbd", "Cafe Aurora", "Cafe", "hospitality", "menu", "1366–1368 London Road", "SW16 4DE", 51.412, -0.121, ["Cafe", "Lunch"]),

    row("biz_c762742e-99e8-6685-dde4-c454d0e62d66", "Imperial War Museum", "Museum", "service", "services", "Lambeth Road", "SE1 6HZ", 51.4958, -0.1086, ["Galleries", "Family visits"], "020 7416 5000"),
    row("biz_9cfc041a-2cdb-a883-d4d6-34a08dbb0074", "Garden Museum", "Museum", "service", "services", "5 Lambeth Palace Road", "SE1 7LB", 51.495, -0.120, ["Garden", "Exhibitions"], "020 7401 8865"),
    row("biz_8aa034a1-453a-eae2-b134-7679658e4b52", "Lambeth Palace", "Historic house", "service", "services", "Lambeth Palace Road", "SE1 7JU", 51.4956, -0.1198, ["Tours", "Library"], "020 7898 1200"),
    row("biz_4e306ba0-1d4e-4743-8436-a97472478dcd", "Florence Nightingale Museum", "Museum", "service", "services", "2 Lambeth Palace Road", "SE1 7EW", 51.500, -0.118, ["Galleries", "Schools"], "020 7620 0374"),
    row("biz_a946cac4-7f40-6ed3-e74f-4c785792c0b9", "Cinema Museum", "Museum", "service", "services", "2 Dugard Way", "SE11 4TH", 51.492, -0.105, ["Tours", "Screenings"], "020 7840 2200"),
    row("biz_4ac74d64-e415-f892-0540-ecfd336751c8", "Southbank Centre", "Arts centre", "service", "services", "Belvedere Road", "SE1 8XX", 51.506, -0.116, ["Concerts", "Galleries"], "020 3879 9555"),
    row("biz_ea6ebbda-fc8d-f524-ae81-ae83a19caeb3", "National Theatre", "Theatre", "service", "services", "Upper Ground", "SE1 9PX", 51.507, -0.114, ["Plays", "Foyer music"], "020 7452 3000"),
    row("biz_0b2ae4d7-a516-c0a6-b2d5-affffae77af0", "BFI Southbank", "Cinema", "service", "services", "Belvedere Road", "SE1 8XT", 51.5067, -0.115, ["Films", "Seasons"], "020 7928 3232"),
    row("biz_f6a2ae7e-b044-5b68-2339-5a1ccfa39431", "The Vaults", "Venue", "service", "services", "Leake Street", "SE1 7NN", 51.502, -0.114, ["Shows", "Graffiti tunnel"], "020 7401 9603"),
    row("biz_b69631eb-d62e-7402-df02-bb9356b55a0a", "Brixton Village", "Market", "hospitality", "menu", "Coldharbour Lane", "SW9 8PR", 51.462, -0.114, ["Food", "Shops"]),
    row("biz_8716102b-c068-e2b4-e40d-5b6c30441729", "Lower Marsh Market", "Market", "hospitality", "menu", "Lower Marsh", "SE1 7AE", 51.502, -0.112, ["Street food", "Stalls"]),
    row("biz_098e1cf2-6a14-2041-130e-b87894e918ab", "London Eye", "Attraction", "service", "services", "Riverside Building, County Hall", "SE1 7PB", 51.5033, -0.1195, ["Rides", "Family"], "0871 781 3000"),
    row("biz_89de6287-11a9-8b26-c73a-39be82fca42c", "Shrek's Adventure", "Attraction", "service", "services", "Riverside Building, County Hall", "SE1 7PB", 51.502, -0.119, ["Family", "Shows"]),
    row("biz_ac6717ae-4897-313b-b219-f4284f083021", "Brockwell Park", "Park", "service", "services", "Dulwich Road", "SE24 0PA", 51.451, -0.106, ["Park", "Events"]),
    row("biz_21b92782-7f56-8b5e-ed9c-d4e8e7765e05", "Vauxhall City Farm", "Farm", "service", "services", "165 Tyers Street", "SE11 5HS", 51.487, -0.121, ["Animals", "Cafe"], "020 7582 4204"),
  ];
  const sites: Record<string, string> = {"biz_c762742e-99e8-6685-dde4-c454d0e62d66": "https://www.iwm.org.uk/visits/iwm-london", "biz_9cfc041a-2cdb-a883-d4d6-34a08dbb0074": "https://gardenmuseum.org.uk/", "biz_8aa034a1-453a-eae2-b134-7679658e4b52": "https://www.archbishopofcanterbury.org/about/lambeth-palace", "biz_4e306ba0-1d4e-4743-8436-a97472478dcd": "https://florence-nightingale-museum.org.uk/", "biz_a946cac4-7f40-6ed3-e74f-4c785792c0b9": "https://www.cinemamuseum.org.uk/", "biz_4ac74d64-e415-f892-0540-ecfd336751c8": "https://www.southbankcentre.co.uk/", "biz_ea6ebbda-fc8d-f524-ae81-ae83a19caeb3": "https://www.nationaltheatre.org.uk/", "biz_0b2ae4d7-a516-c0a6-b2d5-affffae77af0": "https://www.bfi.org.uk/bfi-southbank", "biz_f6a2ae7e-b044-5b68-2339-5a1ccfa39431": "https://www.thevaults.london/", "biz_b69631eb-d62e-7402-df02-bb9356b55a0a": "https://brixtonvillage.com/", "biz_8716102b-c068-e2b4-e40d-5b6c30441729": "https://lowermarshmarket.co.uk/", "biz_098e1cf2-6a14-2041-130e-b87894e918ab": "https://www.londoneye.com/", "biz_89de6287-11a9-8b26-c73a-39be82fca42c": "https://www.shreksadventure.com/", "biz_ac6717ae-4897-313b-b219-f4284f083021": "https://www.brockwelllido.com/", "biz_21b92782-7f56-8b5e-ed9c-d4e8e7765e05": "https://vauxhallcityfarm.org/", "biz_dacbe44e-aad2-3d95-3618-215ca5afcbfc": "https://www.popbrixton.org/", "biz_e306f733-f33f-f592-e53f-82db18629f59": "https://www.oldvictheatre.com/"};
  return rows.map((row) => sites[row.id] ? { ...row, website: sites[row.id], about: row.about + ' Times and tickets are on their site.' } : row);
}

export const SEED_EVENTS: LocalEvent[] = [

  {
    id: "evt_afec4eb9-b280-3c4a-4938-41c0b74eac76",
    kind: "Arts",
    businessId: "iwm-london",
    title: "Imperial War Museum galleries",
    when: "Open most days. Check the site.",
    date: "On now",
    time: "Daytime",
    place: "Imperial War Museum",
    address: "Lambeth Road, SE1 6HZ",
    neighbourhood: "Waterloo & South Bank",
    detail: "The museum site lists the Second World War and Holocaust galleries as the main visit. Book a timed ticket on iwm.org.uk.",
    website: "https://www.iwm.org.uk/visits/iwm-london",
    tickets: "https://www.iwm.org.uk/visits/iwm-london",
    image: "/events/arts.jpg",
    capacity: 0,
    status: "published",
    reason: "",
  },
  {
    id: "evt_5ea90ea1-4121-9934-2680-da3148a551c3",
    kind: "Music",
    businessId: "southbank-centre",
    title: "Southbank Centre foyer programme",
    when: "Most days. Check the site.",
    date: "On now",
    time: "Daytime",
    place: "Southbank Centre",
    address: "Belvedere Road, SE1 8XX",
    neighbourhood: "Waterloo & South Bank",
    detail: "Southbank Centre lists free foyer music and the Hayward Gallery alongside ticketed concerts. See southbankcentre.co.uk for the week.",
    website: "https://www.southbankcentre.co.uk/",
    tickets: "https://www.southbankcentre.co.uk/",
    image: "/events/music.jpg",
    capacity: 0,
    status: "published",
    reason: "",
  },
  {
    id: "evt_0e80463e-4317-57fd-7874-dd4b7594889f",
    kind: "Arts",
    businessId: "bfi-southbank",
    title: "BFI Southbank season",
    when: "Daily screenings. Check the site.",
    date: "On now",
    time: "Evenings",
    place: "BFI Southbank",
    address: "Belvedere Road, SE1 8XT",
    neighbourhood: "Waterloo & South Bank",
    detail: "BFI Southbank lists new releases and seasons. Tickets are on bfi.org.uk.",
    website: "https://www.bfi.org.uk/bfi-southbank",
    tickets: "https://www.bfi.org.uk/bfi-southbank",
    image: "/events/arts.jpg",
    capacity: 0,
    status: "published",
    reason: "",
  },
  {
    id: "evt_f033d597-abcb-8087-a405-0116d271abab",
    kind: "Family",
    businessId: "vauxhall-city-farm",
    title: "Visit Vauxhall City Farm",
    when: "Open days. Check the site.",
    date: "On now",
    time: "Daytime",
    place: "Vauxhall City Farm",
    address: "165 Tyers Street, SE11 5HS",
    neighbourhood: "Vauxhall",
    detail: "The farm lists animal visits and the cafe. Hours are on vauxhallcityfarm.org.",
    website: "https://vauxhallcityfarm.org/",
    tickets: "https://vauxhallcityfarm.org/",
    image: "/events/family.jpg",
    capacity: 0,
    status: "published",
    reason: "",
  },
  {
    id: "evt_5797154f-af8e-7a3b-9981-3989c7d1e3b5",
    kind: "Arts",
    businessId: "",
    title: "Poetry Night at Clapham Library",
    when: "Tuesday 27 October 2026, 6.30pm",
    date: "Tuesday 27 October 2026",
    time: "6.30pm",
    place: "Clapham Library",
    address: "Clapham Library, SW4 7DB",
    neighbourhood: "Clapham",
    detail: "The library programme names Dee Majek and Alex Murdock as hosts, with guest poets including Maia Watkins.",
    website: "https://www.lambeth.gov.uk/sites/default/files/2026-09/lambeth_libraries_black_history_month_2026%20brochure.pdf",
    tickets: "https://www.lambeth.gov.uk/sites/default/files/2026-09/lambeth_libraries_black_history_month_2026%20brochure.pdf",
    image: "/events/poetry.jpg",
    capacity: 0,
    status: "published",
    reason: "",
  },
  {
    id: "evt_3cab93f1-f4a3-8f84-fc2a-934b6d6c68ce",
    kind: "Markets",
    businessId: "",
    title: "Black Culture Market",
    when: "Saturday 10 and Sunday 11 October 2026, 12–5pm",
    date: "Saturday 10 and Sunday 11 October 2026",
    time: "12–5pm",
    place: "Lambeth Town Hall",
    address: "Lambeth Town Hall, Brixton, SW2 1RW",
    neighbourhood: "Brixton",
    detail: "A free Black History Month market of Black-owned businesses, makers and food. Entry is free.",
    website: "https://blackculturemarket.co.uk",
    tickets: "https://londontheinside.com/black-culture-market/",
    image: "/events/culture-market.jpg",
    capacity: 0,
    status: "published",
    reason: "",
  },
  {
    id: "evt_cf621753-e71d-3635-84cc-2f12bc0c1a08",
    kind: "Arts",
    businessId: "",
    title: "Black Zine Fair",
    when: "Saturday 17 October 2026, 12pm",
    date: "Saturday 17 October 2026",
    time: "12pm",
    place: "Brixton Library",
    address: "Brixton Oval, London SW2 1JQ",
    neighbourhood: "Brixton",
    detail: "Lambeth Libraries hosts a fair of Black zines and small-press work. The council listing says 12.00pm to 6.30pm. Eventbrite shows 12pm to 4.30pm, so check the ticket page on the day.",
    website: "https://www.lambeth.gov.uk/events/black-zine-fair",
    tickets: "https://www.eventbrite.co.uk/e/black-zine-fair-tickets-1998547280716",
    image: "/events/zine.jpg",
    capacity: 0,
    status: "published",
    reason: "",
  },
  {
    id: "evt_3ad7e957-0e77-5f98-ec98-af252809e9de",
    kind: "Arts",
    businessId: "",
    title: "Charles Gimpel and Brixton",
    when: "Thursday 22 October 2026, 6.30–8pm",
    date: "Thursday 22 October 2026",
    time: "6.30–8pm",
    place: "Lambeth Archives",
    address: "16 Brixton Hill, London SW2 1ET",
    neighbourhood: "Brixton",
    detail: "A free talk on Charles Gimpel’s photographs of Black families in Brixton. Lambeth Archives asks visitors to book on Eventbrite from the council page.",
    website: "https://www.lambeth.gov.uk/events/charles-gimpel-brixton",
    tickets: "https://www.lambeth.gov.uk/events/charles-gimpel-brixton",
    image: "/events/photos.jpg",
    capacity: 0,
    status: "published",
    reason: "",
  },
  {
    id: "evt_ccf4cbbe-91be-5cd0-9a00-a60bba874c22",
    kind: "Music",
    businessId: "",
    title: "Gospel Orchestrated",
    when: "Saturday 17 October 2026, 7pm",
    date: "Saturday 17 October 2026",
    time: "7pm",
    place: "Streatham Hill Theatre",
    address: "110 Streatham Hill, London SW2 4RD",
    neighbourhood: "Streatham",
    detail: "Lurine Cato and the Brixton Chamber Orchestra, with a gospel choir and band. Tickets are listed at £15–£60.",
    website: "https://brixchamber.com/gigs/gospel",
    tickets: "https://brixchamber.com/gigs/gospel",
    image: "/events/gospel.jpg",
    capacity: 0,
    status: "published",
    reason: "",
  },
  {
    id: "evt_7ec54afb-ac4c-ce61-5097-c16a4ec25850",
    kind: "Music",
    businessId: "biz_6f7f0e5e-f5e1-bcb9-11ed-aaa7777435d5",
    title: "Friday acoustic set",
    when: "Friday 16 October 2026, 7pm",
    date: "Friday 16 October 2026",
    time: "7pm",
    place: "The Brew & Barrel",
    address: "36A Old Town, Clapham, SW4 0LB",
    neighbourhood: "Clapham",
    detail: "A sample evening made for this preview, so Our Events can be opened. The Brew & Barrel has not published this night, and no tickets are on sale.",
    website: "https://www.brewandbarrelsw4.com/",
    tickets: "",
    image: "/events/acoustic.jpg",
    sample: true,
    capacity: 0,
    status: "published",
    reason: "",
  },
  {
    id: "evt_7c4a760b-bf68-0608-3660-7f35d0fdaf37",
    kind: "Food",
    businessId: "biz_536c0361-26a6-fac0-d864-fd72ce9e95b0",
    title: "Saturday sandwich hour",
    when: "Saturday 17 October 2026, 12pm",
    date: "Saturday 17 October 2026",
    time: "12pm",
    place: "Buddy's Deli",
    address: "1 The Polygon, Clapham, SW4 0JG",
    neighbourhood: "Clapham",
    detail: "A sample lunch listing made for this preview, so Our Events can be opened. Buddy's Deli has not published it, and no tickets are on sale.",
    website: "https://eatclub.co.uk/venue/buddys-deli",
    tickets: "",
    image: "/events/sandwich.jpg",
    sample: true,
    capacity: 0,
    status: "published",
    reason: "",
  },
  {
    id: "evt_e297052d-5170-eacf-e620-bad0a50ba0fb",
    kind: "Food",
    businessId: "biz_6cc32cb9-e26f-5610-0e10-beaf8623c2c5",
    title: "Sunday bun morning",
    when: "Sunday 18 October 2026, 10am",
    date: "Sunday 18 October 2026",
    time: "10am",
    place: "Buddy's Coffee Shop",
    address: "26 The Pavement, Clapham Old Town, SW4 0JA",
    neighbourhood: "Clapham",
    detail: "A sample morning made for this preview, so Our Events can be opened. Buddy's Coffee Shop has not published it, and no tickets are on sale.",
    website: "https://www.instagram.com/buddys_deli_bakery/",
    tickets: "",
    image: "/events/buns.jpg",
    sample: true,
    capacity: 0,
    status: "published",
    reason: "",
  },
  {
    id: "evt_682bbc56-9b85-8094-cede-4d1fa42c6680",
    kind: "Music",
    businessId: "",
    title: "Riverside choir hour",
    when: "Thursday 15 October 2026, 6.30pm",
    date: "Thursday 15 October 2026",
    time: "6.30pm",
    place: "Vauxhall Pleasure Gardens",
    address: "Vauxhall Pleasure Gardens, SE11",
    neighbourhood: "Vauxhall",
    detail: "A sample music listing for this preview. It is not a published event, and no tickets are on sale.",
    website: "",
    tickets: "",
    image: "/events/choir.jpg",
    sample: true,
    capacity: 0,
    status: "published",
    reason: "",
  },
  {
    id: "evt_e75a2686-edaf-f9b0-bac9-c2e142710d6b",
    kind: "Food",
    businessId: "",
    title: "Park supper",
    when: "Friday 16 October 2026, 6pm",
    date: "Friday 16 October 2026",
    time: "6pm",
    place: "Kennington Park",
    address: "Kennington Park, SE11",
    neighbourhood: "Kennington",
    detail: "A sample food listing for this preview. It is not a published event, and no tickets are on sale.",
    website: "",
    tickets: "",
    image: "/events/supper.jpg",
    sample: true,
    capacity: 0,
    status: "published",
    reason: "",
  },
  {
    id: "evt_807fdbcd-1686-557a-219d-b5a4e5c0b04d",
    kind: "Arts",
    businessId: "",
    title: "Lower Marsh reading",
    when: "Wednesday 21 October 2026, 7pm",
    date: "Wednesday 21 October 2026",
    time: "7pm",
    place: "Lower Marsh",
    address: "Lower Marsh, Waterloo, SE1",
    neighbourhood: "Waterloo & South Bank",
    detail: "A sample arts listing for this preview. It is not a published event, and no tickets are on sale.",
    website: "",
    tickets: "",
    image: "/events/reading.jpg",
    sample: true,
    capacity: 0,
    status: "published",
    reason: "",
  },
  {
    id: "evt_8cc77bc4-98c4-25c0-b91e-0bfce3eb6b99",
    kind: "Family",
    businessId: "",
    title: "Brockwell family play",
    when: "Sunday 18 October 2026, 11am",
    date: "Sunday 18 October 2026",
    time: "11am",
    place: "Brockwell Park",
    address: "Brockwell Park, Herne Hill, SE24",
    neighbourhood: "Herne Hill",
    detail: "A sample family listing for this preview. It is not a published event, and no tickets are on sale.",
    website: "",
    tickets: "",
    image: "/events/play.jpg",
    sample: true,
    capacity: 0,
    status: "published",
    reason: "",
  },
  {
    id: "evt_e2bf7cda-ea83-5f29-de5c-df874796d279",
    kind: "Community",
    businessId: "",
    title: "Tulse Hill meet-up",
    when: "Saturday 24 October 2026, 10am",
    date: "Saturday 24 October 2026",
    time: "10am",
    place: "Tulse Hill",
    address: "Tulse Hill, SW2",
    neighbourhood: "Tulse Hill",
    detail: "A sample community listing for this preview. It is not a published event, and no tickets are on sale.",
    website: "",
    tickets: "",
    image: "/events/meetup.jpg",
    sample: true,
    capacity: 0,
    status: "published",
    reason: "",
  },
  {
    id: "evt_2ac4a518-f73f-533d-0431-1ee0016fa13e",
    kind: "Markets",
    businessId: "",
    title: "Norwood makers stall",
    when: "Saturday 24 October 2026, 11am–3pm",
    date: "Saturday 24 October 2026",
    time: "11am–3pm",
    place: "West Norwood High Street",
    address: "Norwood Road, SE27",
    neighbourhood: "West Norwood",
    detail: "A sample market listing for this preview. It is not a published event, and no tickets are on sale.",
    website: "",
    tickets: "",
    image: "/events/makers.jpg",
    sample: true,
    capacity: 0,
    status: "published",
    reason: "",
  },
  {
    id: "evt_2df01989-c821-2f74-3dd9-780ee667e902",
    kind: "Music",
    businessId: "",
    title: "Stockwell jazz hour",
    when: "Thursday 22 October 2026, 8pm",
    date: "Thursday 22 October 2026",
    time: "8pm",
    place: "Stockwell",
    address: "Stockwell, SW9",
    neighbourhood: "Stockwell",
    detail: "A sample music listing for this preview. It is not a published event, and no tickets are on sale.",
    website: "",
    tickets: "",
    image: "/events/jazz.jpg",
    sample: true,
    capacity: 0,
    status: "published",
    reason: "",
  },
  {
    id: "evt_10fde4d5-72ca-3348-4976-48b96721af94",
    kind: "Food",
    businessId: "",
    title: "Oval lunch picnic",
    when: "Saturday 17 October 2026, 1pm",
    date: "Saturday 17 October 2026",
    time: "1pm",
    place: "Kennington Oval",
    address: "Kennington Oval, SE11",
    neighbourhood: "Oval",
    detail: "A sample food listing for this preview. It is not a published event, and no tickets are on sale.",
    website: "",
    tickets: "",
    image: "/events/picnic.jpg",
    sample: true,
    capacity: 0,
    status: "published",
    reason: "",
  },
  {
    id: "evt_e875c3d4-1385-5e74-2de3-c0dc72e84a60",
    kind: "Family",
    businessId: "",
    title: "Gipsy Hill family walk",
    when: "Sunday 25 October 2026, 10.30am",
    date: "Sunday 25 October 2026",
    time: "10.30am",
    place: "Gipsy Hill",
    address: "Gipsy Hill, SE19",
    neighbourhood: "Gipsy Hill",
    detail: "A sample family listing for this preview. It is not a published event, and no tickets are on sale.",
    website: "",
    tickets: "",
    image: "/events/walk.jpg",
    sample: true,
    capacity: 0,
    status: "published",
    reason: "",
  },
  {
    id: "evt_470fdcd7-ac64-956b-38fb-228ba9d24823",
    kind: "Community",
    businessId: "",
    title: "Norbury community hour",
    when: "Wednesday 21 October 2026, 4pm",
    date: "Wednesday 21 October 2026",
    time: "4pm",
    place: "Norbury",
    address: "Norbury, SW16",
    neighbourhood: "Norbury",
    detail: "A sample community listing for this preview. It is not a published event, and no tickets are on sale.",
    website: "",
    tickets: "",
    image: "/events/community.jpg",
    sample: true,
    capacity: 0,
    status: "published",
    reason: "",
  },
];

export function visibleNews(stored: NewsItem[] | null | undefined) {
  const rows = Array.isArray(stored) ? stored.filter((row) => row && row.id) : [];
  const ids = new Set(SEED_NEWS.map((row) => row.id));
  return [...SEED_NEWS, ...rows.filter((row) => !ids.has(row.id))];
}

export function visibleEvents(stored: LocalEvent[] | null | undefined) {
  const rows = Array.isArray(stored) ? stored.filter((row) => row && row.id) : [];
  const ids = new Set(SEED_EVENTS.map((row) => row.id));
  return [...SEED_EVENTS, ...rows.filter((row) => !ids.has(row.id) && row.id !== "saturday-loaf")];
}

export const SEED_OFFERS: Offer[] = [
  {
    id: "mkt_df3d749f-e786-1aab-1b51-7758591208e1",
    businessId: "biz_f4393427-4b76-e6d7-54b8-870177dfa5b6",
    title: "Face, nails and massage",
    detail: "Sample price for this preview. Not a published offer from the studio.",
    price: "£25",
    image: "/specials/beu.jpg",
    status: "published",
  },
  {
    id: "mkt_4fc1ca9c-1b6c-e7ff-d6a7-29c849d78484",
    businessId: "biz_536c0361-26a6-fac0-d864-fd72ce9e95b0",
    title: "Sandwiches and salads",
    detail: "Sample price for this preview. Not a published offer from the deli.",
    price: "£8.50",
    image: "/specials/deli.jpg",
    status: "published",
  },
  {
    id: "mkt_4f4daddb-a622-b7f9-752a-d3167367ab87",
    businessId: "biz_6cc32cb9-e26f-5610-0e10-beaf8623c2c5",
    title: "Specialty coffee and bakes",
    detail: "Sample price for this preview. Not a published offer from the coffee shop.",
    price: "£3.50",
    image: "/specials/coffee.jpg",
    status: "published",
  },
  {
    id: "mkt_344041f3-fdbf-07af-a0b1-a444555db964",
    businessId: "biz_6f7f0e5e-f5e1-bcb9-11ed-aaa7777435d5",
    title: "Happy hour",
    detail: "£3.20 is from the February 2024 menu. The £2.50 figure is a sample promotion for this preview.",
    price: "£2.50",
    image: "/specials/brew.jpg",
    status: "published",
  },
  {
    id: "mkt_c0c0eea3-aef4-99a0-3660-9235162d5aff",
    businessId: "biz_f16ac2ca-1bce-371e-4ec7-35ed623bc135",
    title: "Brunch on The Pavement",
    detail: "Sample price for this preview. Not a published offer from the cafe.",
    price: "£12",
    image: "/specials/common.jpg",
    status: "published",
  },
];

export const SEED_HOLDS: Reservation[] = Array.from({ length: 7 }, (_, index) => {
  const id = `sample-hold-${index + 1}`;
  return {
    id,
    eventId: "saturday-loaf",
    accountName: `Sample ${index + 1}`,
    code: ticketCode(id),
    scannedAt: null,
  };
});

export const SEED_NEWS: NewsItem[] = [
  {
    id: "nws_d0430009-d906-51f7-7316-ae9fe2e2de85",
    source: "Love Lambeth",
    title: "Bus priority plans name Acre Lane",
    posted: "9 October 2026, 8.15am",
    excerpt: "Lambeth is asking residents about bus-lane designs for Acre Lane, Norwood Road, Streatham Common North and Croxted Road. The survey runs to 18 October 2026.",
    lead: "Lambeth has put forward designs that would give buses more room on several busy roads, and Acre Lane in Clapham is one of the stretches named. The council says the aim is quicker, more reliable journeys, and it wants people who live or travel here to comment before the survey closes on 18 October 2026.",
    article: [
      "Love Lambeth reports that the council is moving ahead with plans to speed up buses and cut delays on a set of routes through the borough. Acre Lane is the Clapham stretch in that list, alongside Norwood Road, Streatham Common North and Croxted Road.",
      "The published designs are about bus priority: where a bus can keep moving instead of sitting in general traffic. The council is asking residents, and anyone who uses these roads, to look at the designs and say what would help or what would cause a problem.",
      "The consultation stays open until 18 October 2026. This briefing is drawn from that council report. The drawings, the survey and the full wording are on Love Lambeth.",
    ],
    href: "https://love.lambeth.gov.uk/plans-to-speed-up-bus-routes-and-tackle-bus-delays-move-forward/",
    neighbourhood: "Clapham",
    image: "/news/acre-bus.jpg",
    status: "published",
    reason: "",
  },
  {
    id: "nws_741b3748-7f3a-584e-8a9b-c17331c51e36",
    source: "Brixton Buzz",
    title: "Harvest Festival at Brixton Windmill",
    posted: "8 October 2026, 4.40pm",
    excerpt: "The free festival returned to Windmill Gardens on 27 September 2026, with milling, music, food and Morris dancing.",
    lead: "Brixton Windmill’s harvest festival was back in Windmill Gardens on Sunday 27 September 2026. Brixton Buzz reported a free afternoon of milling, live music, food and Morris dancing around the mill.",
    article: [
      "The harvest festival is the windmill’s public day in the gardens on Brixton Hill. This year’s event fell on 27 September 2026, and entry was free.",
      "Brixton Buzz described the mix as bands, Morris dancing, food and drink, with the mill itself working. The report is a photo piece from the afternoon, not a ticketed programme.",
      "The day has passed. The account here follows that report, and the photographs and the rest of the write-up are on Brixton Buzz.",
    ],
    href: "https://www.brixtonbuzz.com/2026/09/bands-morris-dancing-food-and-drink-harvest-festival-at-the-brixton-windmill-sun-27th-sept-2026-twenty-photos/",
    neighbourhood: "Brixton",
    image: "/news/windmill.jpg",
    status: "published",
    reason: "",
  },
  {
    id: "nws_3fcaffb1-61ed-0e6c-01bf-cc943f4a2b5c",
    source: "Love Lambeth",
    title: "Streatham Common North is in the bus-lane plans",
    posted: "7 October 2026, 11.05am",
    excerpt: "Designs for Streatham Common North are part of the same consultation, open until 18 October 2026.",
    lead: "Streatham Common North is one of the roads in Lambeth’s bus-priority consultation. The designs sit in the same survey as Acre Lane, Norwood Road and Croxted Road, and comments are open until 18 October 2026.",
    article: [
      "Love Lambeth says the council wants faster buses and fewer delays, and Streatham Common North is named as one of the places where the designs would change how traffic and buses share the road.",
      "For Streatham that means the consultation is local, not only a Clapham or Brixton story. People who use the common, the shops and the bus stops along that stretch are the ones the survey is aimed at.",
      "The survey closes on 18 October 2026. The maps and the questions are published by the council on Love Lambeth.",
    ],
    href: "https://love.lambeth.gov.uk/plans-to-speed-up-bus-routes-and-tackle-bus-delays-move-forward/",
    neighbourhood: "Streatham",
    image: "/news/streatham-bus.jpg",
    status: "published",
    reason: "",
  },
  {
    id: "nws_15e5962f-6936-4081-5011-359574e2f853",
    source: "Love Lambeth",
    title: "Norwood Road included in the bus consultation",
    posted: "6 October 2026, 9.30am",
    excerpt: "Norwood Road is one of the corridors where Lambeth wants faster, safer bus journeys.",
    lead: "Norwood Road is included in the council’s plans for faster bus journeys. Love Lambeth lists it with the other corridors in a consultation that runs until 18 October 2026.",
    article: [
      "The council’s bus-priority work names Norwood Road as a corridor where buses are delayed and where a new design is being shown to the public. West Norwood is asked to look at that design, not only the stretches further north.",
      "The stated aim is quicker buses and a safer road for the people using them. The same survey covers Acre Lane, Streatham Common North and Croxted Road.",
      "Comments close on 18 October 2026. The proposal itself is the council’s, and the full consultation is on Love Lambeth.",
    ],
    href: "https://love.lambeth.gov.uk/plans-to-speed-up-bus-routes-and-tackle-bus-delays-move-forward/",
    neighbourhood: "West Norwood",
    image: "/news/norwood-bus.jpg",
    status: "published",
    reason: "",
  },
  {
    id: "nws_e5075c9b-1dc2-60ad-e8fe-216f6b01024f",
    source: "Love Lambeth",
    title: "Croxted Road is part of the bus-lane designs",
    posted: "5 October 2026, 2.10pm",
    excerpt: "Croxted Road, on the Herne Hill side, is named in the council’s bus priority consultation.",
    lead: "Croxted Road, on the Herne Hill side of the borough, is named in Lambeth’s bus-lane designs. The council is taking comments until 18 October 2026.",
    article: [
      "Love Lambeth includes Croxted Road in the set of streets where bus priority is being drawn up. For Herne Hill, that is the local piece of a borough-wide consultation.",
      "The other named roads are Acre Lane, Norwood Road and Streatham Common North. The council says it wants buses to be delayed less, and it is asking people who use these roads to respond to the designs.",
      "The survey stays open until 18 October 2026. The drawings are on the council’s Love Lambeth page.",
    ],
    href: "https://love.lambeth.gov.uk/plans-to-speed-up-bus-routes-and-tackle-bus-delays-move-forward/",
    neighbourhood: "Herne Hill",
    image: "/news/herne-bus.jpg",
    status: "published",
    reason: "",
  },
  {
    id: "nws_79c8fa0f-c238-e79b-49cf-ebe316e4d467",
    source: "MyLondon",
    title: "134-room scheme approved on Clapham Road",
    posted: "4 October 2026, 6.20pm",
    excerpt: "Lambeth councillors approved a co-living plan for 68–86 Clapham Road in Oval on 22 September 2026.",
    lead: "Lambeth’s planning committee has approved a co-living scheme for 68–86 Clapham Road, in Oval. MyLondon reported the decision of 22 September 2026, for a building of 134 rooms on a site the council had described as attracting fly-tipping.",
    article: [
      "The site is 68–86 Clapham Road. Councillors approved a co-living development there on 22 September 2026. MyLondon put the scheme at 134 rooms.",
      "The report says the land had been attracting fly-tipping, which was part of the case made for redeveloping it. Approval at committee is not the same as the building being open: it is a planning decision.",
      "The figures and the committee date come from that MyLondon report. The planning papers sit with Lambeth.",
    ],
    href: "https://www.mylondon.news/news/south-london-news/lambeth-site-attracted-fly-tipping-34690772",
    neighbourhood: "Oval",
    image: "/news/oval-rooms.jpg",
    status: "published",
    reason: "",
  },
  {
    id: "nws_387c6d40-9cd8-02eb-59c3-3cfdd9ce9931",
    source: "South London and Maudsley",
    title: "A farewell to Lambeth Hospital",
    posted: "3 October 2026, 10.00am",
    image: "/news/stockwell-hospital.jpg",
    excerpt: "Staff marked the move of the last wards from the Stockwell site. The trust has agreed a sale of the land for new homes.",
    lead: "South London and Maudsley NHS Trust has marked the last wards leaving Lambeth Hospital in Stockwell. The trust says the land is being sold for new homes, after staff held a farewell on the site.",
    article: [
      "Lambeth Hospital, on Landor Road in Stockwell, has been winding down as wards moved to other sites. The trust’s own account is a farewell from the staff who worked there.",
      "The trust says it has agreed a sale of the land so the site can be used for new homes. That is the trust’s statement, not a planning notice in this app.",
      "The farewell and the sale are set out by South London and Maudsley. Their post is the source for this briefing.",
    ],
    href: "https://slam.nhs.uk/blog/a-fond-farewell-to-lambeth-hospital-6187",
    neighbourhood: "Stockwell",
    status: "published",
    reason: "",
  },
  {
    id: "nws_52b177c4-21e6-539e-cfc0-ea8f08f85000",
    source: "Brixton Buzz",
    title: "Lambeth shortlisted for its support of theatres",
    excerpt: "The piece notes council support for The Old Vic’s Backstage development, on the Waterloo and South Bank side of the borough.",
    lead: "Lambeth has been shortlisted for a national award for its support of theatres and cultural spaces. Brixton Buzz notes the council’s backing for The Old Vic’s Backstage development, on the Waterloo and South Bank side of the borough.",
    article: [
      "The shortlist is for support of theatres, not for a single show. Brixton Buzz reports that Lambeth’s work with cultural buildings is what put the council forward.",
      "The local example in that report is The Old Vic’s Backstage development. The theatre sits by Waterloo, so the story is filed here rather than with the Brixton venues.",
      "The award has not been decided in this briefing. The shortlist and the council’s role are described by Brixton Buzz.",
    ],
    href: "https://www.brixtonbuzz.com/2026/09/lambeth-shortlisted-for-national-award-for-its-support-of-theatres-and-cultural-spaces/",
    neighbourhood: "Waterloo & South Bank",
    image: "/news/waterloo-theatre.jpg",
    status: "published",
    reason: "",
  },
  {
    id: "nws_eed6abe6-1468-fa42-8549-52c38be81b68",
    source: "BBC News",
    title: "Second-tallest residential plan approved at Vauxhall",
    excerpt: "Lambeth councillors approved a £2bn Vauxhall Square scheme in September 2026. The tallest of seven buildings would be 230.5 metres.",
    lead: "Lambeth councillors have approved the Vauxhall Square scheme. The BBC reported a £2 billion plan of seven buildings, the tallest of them 230.5 metres, which would be the second-tallest residential building yet approved in Britain.",
    article: [
      "The decision was taken in September 2026. The BBC describes seven buildings on the Vauxhall Square site, and a tower of 230.5 metres.",
      "The report puts the scheme at about £2 billion. Approval by the council is a planning decision. It does not mean the tower is already under construction.",
      "The height, the price and the ‘second-tallest’ description are the BBC’s, from its report of the meeting. The planning file is Lambeth’s.",
    ],
    href: "https://www.bbc.co.uk/news/articles/crm9e9438wlo",
    neighbourhood: "Vauxhall",
    image: "/news/vauxhall-tower.jpg",
    status: "published",
    reason: "",
  },
  {
    id: "nws_1d91faed-c081-5753-1f6e-c6a1dcad4bc3",
    source: "Brixton Buzz",
    title: "Kennington estate without running water",
    excerpt: "Residents of the Brittany estate told Brixton Buzz they had been without running water since 2 July 2026, and that the council had sent two 5-litre bottles per household.",
    lead: "Residents on the Brittany estate in Kennington told Brixton Buzz they had been without running water since 2 July 2026. They said the council had sent two 5-litre bottles of water to each household.",
    article: [
      "Brixton Buzz reported the outage in July 2026. The estate is in Kennington, and the residents who spoke to the site said the taps had been dry since Thursday 2 July.",
      "The same report says Lambeth had delivered two 5-litre bottles per household. That was the help described at the time of the article, not a statement that the supply had been restored.",
      "This briefing follows that report. The residents’ account and any later updates are on Brixton Buzz.",
    ],
    href: "https://www.brixtonbuzz.com/2026/07/kennington-residents-without-running-water-since-last-thursday-2nd-july-2026/",
    neighbourhood: "Kennington",
    image: "/news/kennington-water.jpg",
    status: "published",
    reason: "",
  },
  {
    id: "nws_a00275c3-a2c4-fe78-88a7-b93cd59384d9",
    source: "Metro",
    title: "Police operation names Tulse Hill",
    excerpt: "Metro reported a September 2026 police operation across Lambeth and Southwark. Officers on the tour named Upper and Lower Tulse Hill.",
    lead: "Metro joined a police operation in September 2026 that covered parts of Lambeth and Southwark. Officers on that tour named Upper Tulse Hill and Lower Tulse Hill among the streets in the operation.",
    article: [
      "The Metro piece is a ride-along with officers, published on 4 September 2026. It describes the operation as aimed at gangs working across south London, not as a notice from the council.",
      "Tulse Hill is named because the officers pointed out Upper and Lower Tulse Hill during the tour. The report does not publish a list of arrests for those two roads.",
      "The account here follows Metro’s report of the day. The paper’s article has the officers’ comments in full.",
    ],
    href: "https://metro.co.uk/2026/09/04/metro-joins-police-crackdown-gang-kingdoms-operating-south-london-29527713",
    neighbourhood: "Tulse Hill",
    image: "/news/tulse-police.jpg",
    status: "published",
    reason: "",
  },
  {
    id: "nws_9e4f1e79-1f67-bea4-bf53-be4f8466c916",
    source: "Brixton Buzz",
    title: "Healthy route extended toward Gipsy Hill",
    excerpt: "Lambeth proposed Phase 3 of the Brockwell Park to Gipsy Hill route, from the South Circular to Park Hall Road, with five new zebra crossings.",
    lead: "Lambeth has proposed the next stretch of the healthy route from Brockwell Park toward Gipsy Hill. Brixton Buzz reported Phase 3, from the South Circular to Park Hall Road, with five new zebra crossings.",
    article: [
      "The route is the council’s walking and cycling link between Brockwell Park and Gipsy Hill. Phase 3 is the section from the South Circular up to Park Hall Road.",
      "Brixton Buzz says the proposal includes five new zebra crossings. It was reported as a scheme the council was set to build, in a piece published in January 2026.",
      "The crossings and the extent of the phase are from that report. The drawings, if they have been updated since, are the council’s.",
    ],
    href: "https://www.brixtonbuzz.com/2026/01/lambeth-set-to-build-healthy-route-extension-with-five-new-zebra-crossings-in-west-dulwich/",
    neighbourhood: "Gipsy Hill",
    image: "/news/gipsy-route.jpg",
    status: "published",
    reason: "",
  },
  {
    id: "nws_85d92894-d1e8-3172-0629-957a6b3cd4d1",
    source: "Croydon Council",
    title: "Norbury Library closed for a water-main repair",
    excerpt: "The council notice said Norbury Library was closed on 18 and 19 August 2026 because a water main had burst nearby. The library sits on the Lambeth boundary.",
    lead: "Norbury Library was closed on 18 and 19 August 2026 after a water main burst nearby. Croydon Council posted the closure. The library serves the Norbury edge of Lambeth as well as Croydon.",
    article: [
      "The notice was a short closure for a burst main, not a permanent shutdown. Croydon Council gave the dates as 18 and 19 August 2026.",
      "Norbury sits on the borough boundary, which is why the story is filed with Lambeth’s Norbury neighbourhood even though the notice came from Croydon.",
      "This briefing follows that notice. The library’s own page is the place to check whether a later closure has been announced.",
    ],
    href: "https://www.croydon.gov.uk/libraries-leisure-and-culture/libraries/find-your-library/upper-norwood-library-hub",
    neighbourhood: "Norbury",
    image: "/news/norbury-library.jpg",
    status: "published",
    reason: "",
  },
];
