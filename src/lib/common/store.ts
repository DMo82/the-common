import { pictureFor } from "@/lib/common/pictures";
import { typeId } from "@/lib/common/typeid";
import { isLambethPostcode } from "@/lib/common/boundaries";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { visibleListings } from "@/lib/common/market";
import { SUPER_EMAIL, canAccess, type StaffDuty, type StaffGrant } from "@/lib/common/staff";
import {
  SEED_BUSINESSES,
  SEED_EVENTS,
  SEED_HOLDS,
  SEED_NEWS,
  SEED_OFFERS,
  ticketCode,
  areaFor,
  DEMO_OWNER_EMAIL,
  ownsRecord,
  type Account,
  type Audit,
  type Booking,
  type Business,
  type Enquiry,
  type Indemnity,
  type Listing,
  type ListingMessage,
  type CvApplication,
  type EventKind,
  type LocalEvent,
  type NewsItem,
  type Offer,
  type Rating,
  type Report,
  type Incident,
  type Reservation,
  type Status,
} from "./model";

const DEMO_ACCOUNT: Account = {
  id: "usr_super",
  name: "Super user",
  email: DEMO_OWNER_EMAIL,
  username: DEMO_OWNER_EMAIL,
  passwordHash: "Common2026",
  over18: true,
  kind: "business",
  neighbourhood: "Clapham",
};


const TEST_USERS: Account[] = [
  { id: "usr_amina", name: "Amina Patel", email: "amina@test.common", username: "amina@test.common", over18: true, kind: "business", neighbourhood: "Brixton", agreement: true, approved: true },
  { id: "usr_jon", name: "Jon Hale", email: "jon@test.common", username: "jon@test.common", over18: true, kind: "organiser", neighbourhood: "Clapham", agreement: true, approved: true },
  { id: "usr_ruth", name: "Ruth Cole", email: "ruth@test.common", username: "ruth@test.common", over18: true, kind: "club", neighbourhood: "Streatham", agreement: true, approved: true },
  { id: "usr_priya", name: "Priya Shah", email: "priya@test.common", username: "priya@test.common", over18: true, kind: "council", neighbourhood: "Lambeth", agreement: true, approved: false },
  { id: "usr_owen", name: "Owen Blake", email: "owen@test.common", username: "owen@test.common", passwordHash: "Journal1", over18: true, kind: "journalist", neighbourhood: "Brixton", approved: true },
  { id: "usr_leah", name: "Leah Grant", email: "leah@test.common", username: "leah@test.common", over18: true, kind: "author", neighbourhood: "Herne Hill", approved: true },
  { id: "usr_admin", name: "Admin desk", email: "support@thecommon.community", username: "support@thecommon.community", passwordHash: "Admin1", over18: true, kind: "author", neighbourhood: "Lambeth", approved: true },
];

function stampDemo<T extends { id: string; ownerEmail?: string }>(rows: T[], ids: Set<string>) {
  return rows.map((row) => (ids.has(row.id) ? { ...row, ownerEmail: DEMO_OWNER_EMAIL } : row));
}

type CommonState = {
  account: Account | null;
  ageBlocked: boolean;
  ageOk: boolean | null;
  pendingCode: string;
  pendingEmail: string;
  cookieChoice: "" | "essential" | "measures";
  measures: { views: number; signups: number; logins: number; favourites: number; bookings: number; reports: number; messages: number };
  confirmAge: (ok: boolean) => void;
  setCookieChoice: (choice: "essential" | "measures") => void;
  noteMeasure: (key: "views" | "signups" | "logins" | "favourites" | "bookings" | "reports" | "messages") => void;
  noteShare: (businessId: string) => void;
  beginSignIn: (email: string) => { ok: true; code: string } | { ok: false };
  confirmSignIn: (email: string, code: string) => boolean;
  businesses: Business[];
  offers: Offer[];
  events: LocalEvent[];
  reservations: Reservation[];
  bookings: Booking[];
  listings: Listing[];
  listingMessages: ListingMessage[];
  cvApplications: CvApplication[];
  enquiries: Enquiry[];
  messageLog: { id: string; at: string; actor: string; action: string; target: string; body: string }[];
  messageReports: { id: string; at: string; from: string; target: string; reason: string; status: "open" | "reviewed" }[];
  reports: Report[];
  watchList: { id: string; at: string; target: string; reason: string }[];
  incidents: Incident[];
  serviceEdits: Record<string, { name?: string; address?: string; detail?: string }>;
  hiddenServices: string[];
  saveService: (id: string, patch: { name?: string; address?: string; detail?: string }) => void;
  hideService: (id: string) => void;
  councilNotes: { id: string; at: string; kind: "complaint" | "suggestion" | "concern"; neighbourhood: string; body: string; name: string }[];
  submitNews: (input: { title: string; source: string; excerpt: string; neighbourhood: string; href?: string; image?: string; author?: string; phone?: string; email?: string }) => boolean;
  requestNewsChange: (input: { newsId: string; action: "edit" | "delete"; title?: string; excerpt?: string; href?: string }) => boolean;
  markNotificationRead: (id: string) => void;
  decideNewsChange: (id: string, approve: boolean, reason: string) => void;
  transportNote: string;
      requestTransport: (note: string) => string;
  fileCouncilNote: (input: { kind: "complaint" | "suggestion" | "concern"; neighbourhood: string; body: string; name: string }) => void;
  news: NewsItem[];
  notifications: { id: string; at: string; forRole: "admin" | "journalist"; forName: string; body: string; read: boolean }[];
  newsRequests: { id: string; newsId: string; action: "edit" | "delete"; title: string; excerpt: string; href: string; author: string; status: "pending" | "approved" | "refused" }[];
  ratings: Rating[];
  indemnities: Indemnity[];
  follows: string[];
  saves: string[];
  likes: string[];
  favourites: string[];
  audit: Audit[];
  ageDeclarations: { id: string; at: string; username: string; userId: string; role: string; type: string; terms: string; status: string }[];
  staffGrants: StaffGrant[];
  directory: Account[];
  setAccount: (profile: Omit<Account, "over18">) => void;
  updateUser: (email: string, patch: Partial<Account>) => void;
  assignBusiness: (id: string, email: string) => string;
  assignEvent: (id: string, email: string) => string;
  requestAllocation: (kind: "business" | "event" | "listing", itemId: string, email: string) => string;
  decideAllocation: (id: string, approve: boolean) => string;
  transferOwnership: (kind: "business" | "event" | "listing" | "news", itemId: string, email: string) => string;
  moderateEdit: (kind: "business" | "event" | "listing" | "news", id: string, patch: Record<string, string>) => string;
  roleRequests: { id: string; email: string; name: string; detail: string; patch: Partial<import("./model").Account>; duties?: string[]; from: string; status: "waiting" | "approved" | "refused" }[];
  requestRole: (email: string, patch: Partial<import("./model").Account>, duties?: string[]) => string;
  decideRole: (id: string, approve: boolean) => string;
  allocations: { id: string; kind: "business" | "event" | "listing"; businessId: string; businessName: string; userEmail: string; userName: string; from: string; status: "waiting" | "approved" | "refused"; decidedAt?: string }[];
  signIn: (email: string) => boolean;
  signInWithPassword: (username: string, password: string) => string;
  requestReset: (username: string) => string;
  resetPassword: (token: string, password: string) => string;
  resets: { token: string; username: string; email: string }[];
  failedLogins: Record<string, { count: number; until: number }>;
  requestErasure: () => string;
  clearAccount: () => void;
  blockUnder18: () => void;
  follow: (id: string) => void;
  save: (id: string) => void;
  toggleSave: (id: string) => boolean;
  toggleLike: (id: string) => boolean;
  toggleFavourite: (id: string) => boolean;
  noteDirections: (id: string) => void;
  rate: (businessId: string, stars: number) => void;
  saveIndemnity: (input: Omit<Indemnity, "id" | "at" | "accountName">) => void;
  enquire: (businessId: string, body: string, eventId?: string) => void;
  markEnquiryRead: (id: string) => void;
  markListingRead: (id: string) => void;
  deleteMessages: (ids: string[]) => void;
  reportMessage: (input: { target: string; reason: string }) => void;
  reviewReport: (id: string) => void;
  watch: (target: string, reason: string) => void;
  replyEnquiry: (id: string, reply: string) => void;
  deleteEnquiry: (id: string) => void;
  replyListing: (id: string, reply: string) => void;
  deleteListingMessage: (id: string) => void;
  requestBooking: (input: { businessId: string; kind: "service" | "table"; party: string; when: string }) => { ok: true; code: string } | { ok: false; reason: string };
  postEvent: (input: { businessId: string; title: string; detail?: string; when: string; kind?: EventKind; place?: string; postcode?: string; website?: string; phone?: string; email?: string; tickets?: boolean; ticketPrice?: number; image?: string; video?: string }) => boolean;
  postListing: (input: {
    businessId: string;
    kind: "job" | "equipment";
    title: string;
    detail: string;
    category?: string;
    subcategory?: string;
    listingType?: Listing["listingType"];
    condition?: Listing["condition"];
    priceBand?: Listing["priceBand"];
    priceLabel?: string;
    image?: string;
    video?: string;
  }) => void;
  messageListing: (listingId: string, body: string) => void;
  submitCv: (listingId: string, fileName: string) => boolean;
  reserve: (eventId: string) => { ok: true; code: string } | { ok: false; reason: string };
  report: (target: string, body: string, reason?: string) => string;
  blocked: string[];
  block: (id: string) => void;
  unblock: (id: string) => void;
  fileIncident: (input: { neighbourhood: string; service: "police" | "fire"; description: string; anonymous: boolean; name: string; imageName: string }) => void;
  submitBusiness: (input: { name: string; address: string; postcode: string; phone: string; email: string; hours: string }) => string;
  setMember: (kind: "business" | "event", id: string, email: string, role: "owner" | "staff", duty?: string) => string;
  removeMember: (kind: "business" | "event", id: string, email: string) => string;
  updateBusiness: (id: string, input: { name: string; about: string; address: string; postcode: string; phone: string; email: string; hours: string; specialHours?: { label: string; from: string; to: string; opens: string; closes: string; closed?: boolean }[]; cover?: string; gallery?: string[]; video?: string; hero?: string; social?: { instagram?: string; facebook?: string; tiktok?: string; x?: string }; reel?: string; bookings?: boolean; appointments?: boolean; chatOn?: boolean; menu?: Business["menu"] }) => void;
  issueClaim: (id: string) => string;
  claimBusiness: (code: string) => string;
  removeEvent: (id: string) => void;
  removeListing: (id: string) => void;
  removeOffer: (id: string) => void;
  updateEvent: (id: string, input: { title: string; when: string; kind: EventKind; place: string; detail: string; image?: string; tickets?: string; capacity?: number; phone?: string; email?: string; website?: string }) => void;
  saveOffer: (businessId: string, input: { id?: string; title: string; detail: string; price?: string; image?: string }) => void;
  resubmit: (id: string) => void;
  decide: (kind: "business" | "event" | "news" | "listing", id: string, status: Status, reason: string, actor: string, checks?: string[]) => void;
  recommend: (kind: "business" | "event" | "news" | "listing", id: string, status: Status, reason: string, actor: string) => void;
  submissions: { id: string; kind: "business" | "event" | "news" | "listing"; itemId: string; status: Status; reason: string; by: string; at: string }[];
  appeal: (id: string) => void;
  settleAppeal: (id: string, outcome: "upheld" | "sent_back" | "substituted", actor: string) => void;
  closeReport: (id: string, outcome: string, actor: string) => string;
  updateCase: (id: string, patch: { category?: string; severity?: "low" | "medium" | "high"; assigned?: string; notes?: string; escalated?: boolean; outcome?: string }) => void;
  scan: (code: string, eventId: string) => { ok: true; name: string } | { ok: false; reason: string };
  scanByName: (name: string, eventId: string) => { ok: true; name: string } | { ok: false; reason: string };
  flagAge: (id: string, reason: string) => void;
  confirmAdult: (id: string, reason: string) => void;
  removeAgeAccount: (id: string, reason: string) => void;
  setStaffGrant: (email: string, duties: StaffDuty[]) => void;
};


const SEED_REPORTS = [
  { id: "aud_2cec0cd8-729b-1519-132e-6ae925f871d0", target: "Market listing: free sofa", from: "A neighbour", body: "The listing uses a slur in the description.", status: "open" as const, outcome: "", category: "D02", severity: "high" as const, notes: "Hidden from the public queue. Waiting for the safeguarding officer." },
  { id: "aud_de948ffc-cf45-692d-749a-06108d8cf7be", target: "Buddy's Deli offer", from: "James", body: "The price on the listing does not match the till.", status: "open" as const, outcome: "", category: "D04", severity: "medium" as const },
  { id: "aud_e4260a59-6f9f-c872-067f-ddb4cca27452", target: "Poetry night", from: "Amira", body: "The date looked wrong.", status: "closed" as const, outcome: "Checked with the organiser. The date is correct.", category: "D07", severity: "low" as const },
];

const SEED_AUDIT = [
  { id: "aud_5689fc41-1674-474e-30c7-5be00391d6c2", at: "2026-10-12T09:10:00.000Z", actor: "admin@thecommon.community", action: "Approval published", target: "biz_f4393427-4b76-e6d7-54b8-870177dfa5b6", reason: "Hours and contact checked." },
  { id: "aud_55828bbe-e632-5eb0-02ba-935ced52ff1f", at: "2026-10-12T11:20:00.000Z", actor: "admin@thecommon.community", action: "Approval changes_requested", target: "mkt_9118f771-3322-c5be-0163-027c30bc52e0", reason: "D07: Add a Lambeth postcode." },
  { id: "aud_0b1acb9c-d5fb-075c-add1-8e51ba27c32d", at: "2026-10-12T14:05:00.000Z", actor: "Moderator", action: "Updated case", target: "aud_2cec0cd8-729b-1519-132e-6ae925f871d0", reason: "Severity set to high." },
  { id: "aud_b84ea48f-aacf-13a1-f8ff-12f7483659e9", at: "2026-10-13T08:40:00.000Z", actor: "admin@thecommon.community", action: "Report closed", target: "aud_e4260a59-6f9f-c872-067f-ddb4cca27452", reason: "Date confirmed with the organiser." },
];

const SEED_FLAGS = [
  { id: "aud_8ae9360c-8f68-cbb5-25b6-eb9e4f0d97f8", at: "2026-10-12T16:00:00.000Z", from: "Amira", target: "Buddy's Deli", reason: "A reply felt rude.", status: "open" as const },
];

function stamp(actor: string, action: string, target: string, reason: string): Audit {
  return { id: typeId("audit"), at: new Date().toISOString(), actor, action, target, reason };
}

export const useCommon = create<CommonState>()(
  persist(
    (set, get) => ({
      account: null,
      ageBlocked: false,
      ageOk: null,
      pendingCode: "",
      pendingEmail: "",
      cookieChoice: "",
      measures: { views: 0, signups: 0, logins: 0, favourites: 0, bookings: 0, reports: 0, messages: 0 },
      confirmAge: (ok) => set({ ageOk: ok, ageBlocked: !ok, account: ok ? get().account : null }),
      setCookieChoice: (choice) => set({ cookieChoice: choice }),
      noteMeasure: (key) => set({ measures: { ...get().measures, [key]: (get().measures?.[key] ?? 0) + 1 } }),
      noteShare: (businessId) => set({ businesses: get().businesses.map((row) => row.id === businessId ? { ...row, shares: (row.shares || 0) + 1 } : row) }),
      beginSignIn: (email) => {
        const key = email.trim().toLowerCase();
        const found = (get().directory ?? []).find((row) => row.email === key);
        if (!found) return { ok: false };
        const code = String(Math.floor(100000 + Math.random() * 900000));
        set({ pendingCode: code, pendingEmail: key });
        return { ok: true, code };
      },
      confirmSignIn: (email, code) => {
        const key = email.trim().toLowerCase();
        if (get().pendingEmail !== key || get().pendingCode !== code.trim()) return false;
        const found = (get().directory ?? []).find((row) => row.email === key);
        if (!found) return false;
        set({ account: found, ageBlocked: false, ageOk: true, pendingCode: "", pendingEmail: "", measures: { ...get().measures, logins: (get().measures?.logins ?? 0) + 1 } });
        return true;
      },
      businesses: [
        ...stampDemo(SEED_BUSINESSES, new Set(SEED_BUSINESSES.map((row) => row.id))),
        { id: "biz_29be9778-54b0-670a-263c-a8edbad4cae7", name: "Clapham Cut", category: "Barber", trade: "service", shelf: "services", address: "12 Clapham High Street", postcode: "SW4 7UL", lat: 51.462, lng: -0.138, phone: "020 7000 0000", email: "hello@claphamcut.test", hours: "Tue–Sat 9:00–18:00", about: "A new barber waiting for a first check.", website: "", services: ["Cut"], menu: [], menuNote: "", access: "not_stated", proof: "Companies House not checked.", status: "pending", reason: "", appeal: "none", views: 0, clicks: 0, directions: 0, ownerEmail: "buddy@buddys.test" },

        { id: "biz_c3f8d1e6-9a20-4c77-b5e4-8d2f7a6c1e90", name: "The Avalon", category: "Pub", trade: "hospitality", shelf: "menu", address: "16 Clapham Common South Side", postcode: "SW4 7AB", lat: 51.4593, lng: -0.1418, phone: "020 7627 4977", email: "avalon@youngs.co.uk", hours: "Daily 12:00–23:00", about: "A Young's pub on Clapham Common South Side, with food and a garden.", website: "https://www.theavalonclapham.com/", services: ["Food", "Drinks"], menu: [], menuNote: "", access: "not_stated", proof: "Companies House not checked.", status: "pending", reason: "", appeal: "none", views: 0, clicks: 0, directions: 0, ownerEmail: "buddy@buddys.test" },
        { id: "biz_8b3d7b92-d44b-1b5a-13e2-89f45021f946", name: "Northcote Kiosk", category: "Cafe", trade: "hospitality", shelf: "menu", address: "4 Northcote Road", postcode: "SW11 1NT", lat: 51.46, lng: -0.166, phone: "020 7000 0001", email: "hi@kiosk.test", hours: "Daily 8:00–16:00", about: "Declined for a lookalike name. Appeal waiting.", website: "", services: [], menu: [], menuNote: "", access: "not_stated", proof: "", status: "refused", reason: "D06: The name matches another page.", appeal: "waiting", views: 0, clicks: 0, directions: 0, ownerEmail: "buddy@buddys.test" },
      ],
      offers: SEED_OFFERS,
      events: [
        ...stampDemo(SEED_EVENTS, new Set(SEED_EVENTS.map((row) => row.id))),
        { id: "evt_d4a9b2c7-6e11-4f83-a0d5-3b7c8e9f1a24", kind: "Music", businessId: "", title: "Live at The Windmill", when: "Friday 23 October 2026, 7.30pm", date: "Friday 23 October 2026", time: "7.30pm", place: "The Windmill", address: "22 Blenheim Gardens, Brixton, SW2 5BZ", neighbourhood: "Brixton", detail: "A gig night at The Windmill, the Brixton venue known for new bands. Tickets on the venue site.", website: "https://windmillbrixton.co.uk/", tickets: "https://windmillbrixton.co.uk/", image: "/events/music.jpg", capacity: 150, status: "pending", reason: "", ownerEmail: "buddy@buddys.test" },
        { id: "evt_e5b0c3d8-7f22-4a94-b1e6-4c8d9f0a2b35", kind: "Family", businessId: "", title: "Brockwell Lido open swim", when: "Saturday 24 October 2026, 8.00am", date: "Saturday 24 October 2026", time: "8.00am", place: "Brockwell Lido", address: "Brockwell Park, Dulwich Road, SE24 0PA", neighbourhood: "Herne Hill", detail: "A public open swim session at Brockwell Lido. Book a lane on the lido site.", website: "https://www.brockwelllido.com/", tickets: "https://www.brockwelllido.com/", image: "/events/family.jpg", capacity: 40, status: "pending", reason: "", ownerEmail: "buddy@buddys.test" },
        { id: "evt_f6c1d4e9-8a33-4b05-c2f7-5d9e0a1b3c46", kind: "Arts", businessId: "", title: "National Theatre foyer exhibition", when: "Daily until 30 November 2026", date: "On now", time: "Daytime", place: "National Theatre", address: "Upper Ground, South Bank, SE1 9PX", neighbourhood: "Waterloo & South Bank", detail: "A free foyer exhibition at the National Theatre. Entry is free; theatre tickets are separate.", website: "https://www.nationaltheatre.org.uk/", tickets: "", image: "/events/arts.jpg", capacity: 0, status: "pending", reason: "", ownerEmail: "buddy@buddys.test" },
      ],
      reservations: SEED_HOLDS,
      bookings: [],
      listings: [
        { id: "mkt_9118f771-3322-c5be-0163-027c30bc52e0", businessId: "", kind: "equipment", title: "Free sofa", detail: "Two-seat sofa, collect from Clapham.", status: "pending", category: "Home & Garden" },
        { id: "mkt_a2d5e7f9-1b44-4c66-8d30-7e1f3a5b9c82", businessId: "", kind: "job", title: "Barista at Pop Brixton", detail: "Pop Brixton is hiring a barista for a weekend stall. Experience with espresso preferred. Apply with a short note.", status: "pending", category: "Jobs & Services", listingType: "service", priceLabel: "Hourly", ownerEmail: "buddy@buddys.test", ownerName: "Buddy" },
        { id: "mkt_b3e6f8a0-2c55-4d77-9e41-8f2a4b6c0d93", businessId: "", kind: "equipment", title: "Commercial espresso machine", detail: "A two-group espresso machine from a closing cafe in Brixton. Used, working, collect from SW9.", status: "pending", category: "Business & Commercial", listingType: "sale", condition: "used", priceLabel: "£850", ownerEmail: "buddy@buddys.test", ownerName: "Buddy" },
        { id: "mkt_c4f7a9b1-3d66-4e88-af52-9a3b5c7d1e04", businessId: "", kind: "equipment", title: "Kids bike, free to collect", detail: "A 20 inch kids bike in good condition. Free, collect from Clapham Common South Side.", status: "pending", category: "Sports & Leisure", listingType: "free", condition: "good", priceLabel: "Free", ownerEmail: "buddy@buddys.test", ownerName: "Buddy" },
      ],
      listingMessages: [
        {
          id: "lm-van",
          listingId: "m-van",
          from: "A neighbour",
          body: "Is the van still available this week?",
          reply: "Yes. Message here and we will answer on this phone.",
        },
      ],
      cvApplications: [],
      enquiries: [
        { id: "aud_7b17a46a-268f-cb13-e433-88683e4f053c", businessId: "biz_536c0361-26a6-fac0-d864-fd72ce9e95b0", from: "Amira", body: "Have you a table for four on Friday at 7?", reply: "", at: "2026-10-08T18:10:00.000Z", read: false },
        { id: "aud_a6c61c6d-4e68-efae-0f07-6906c1453360", businessId: "biz_536c0361-26a6-fac0-d864-fd72ce9e95b0", from: "James", body: "Do the sandwiches still come with the pickle?", reply: "Yes, unless you ask us to leave it off.", at: "2026-10-07T12:00:00.000Z", read: true },
        { id: "aud_80e3f2e2-3b20-de63-b3fb-fdd442429858", businessId: "biz_536c0361-26a6-fac0-d864-fd72ce9e95b0", from: "Admin", body: "Buddy's Deli: Approved. Hours and menu look fine.", reply: "", at: "2026-10-08T09:00:00.000Z", read: false },
        { id: "aud_a856e1a4-27dc-c264-6f92-f37ad95f15f1", businessId: "biz_536c0361-26a6-fac0-d864-fd72ce9e95b0", eventId: "evt_7c4a760b-bf68-0608-3660-7f35d0fdaf37", from: "Admin", body: "Buddy's tasting: Changes requested. Add a Lambeth postcode.", reply: "", at: "2026-10-06T15:30:00.000Z", read: false },
      ],
      messageLog: [],
      messageReports: SEED_FLAGS,
      reports: SEED_REPORTS,
      blocked: [],
      watchList: [],
      incidents: [],
      serviceEdits: { "brixton-police": { name: "Brixton Police Station", address: "367 Brixton Road, SW9 7DD", detail: "Hours updated to 8am–8pm. Waiting for a check." } },
      hiddenServices: [],
      transportNote: "",
      councilNotes: [],
      news: [...SEED_NEWS, { id: "nws_b2162f3a-2692-b73d-9841-6c240aa7c04f", source: "Local reporter", title: "Saturday market on Acre Lane", excerpt: "A short note about a Saturday stall.", href: "", neighbourhood: "Clapham", posted: "13 October 2026, 9.00am", status: "pending", reason: "" }],
      newsRequests: [],
      notifications: [],
      ratings: [],
      indemnities: [],
      follows: [],
      saves: [],
      likes: [],
      favourites: [],
      audit: SEED_AUDIT,
      ageDeclarations: [
        { id: "aud_age_1", at: "2026-10-12T09:00:00.000Z", username: "amina@test.common", userId: "usr_amina", role: "business", type: "signup", terms: "v1.0", status: "Declared" },
        { id: "aud_age_2", at: "2026-10-13T11:20:00.000Z", username: "jon@test.common", userId: "usr_jon", role: "organiser", type: "signup", terms: "v1.0", status: "Declared" },
      ],
      staffGrants: [{ email: "admin@thecommon.community", duties: ["admin"] }],
      roleRequests: [],
      allocations: [],
      directory: [DEMO_ACCOUNT, ...TEST_USERS],
      resets: [],
      failedLogins: {},
      submissions: [],
      updateUser: (email, patch) => {
        const key = email.trim().toLowerCase();
        if (get().account?.email?.toLowerCase() !== "dvmorris.dm@gmail.com") return;
        set({ directory: (get().directory ?? []).map((row) => row.email === key ? { ...row, ...patch, email: key } : row), audit: [stamp(get().account?.email || "Super user", "Edited user", key, patch.kind || (patch.agreement ? "agreement signed" : "profile")), ...get().audit] });
      },
      assignBusiness: (id, email) => {
        if (get().account?.email?.toLowerCase() !== "dvmorris.dm@gmail.com") return "Only the super user can allocate a shop.";
        const user = (get().directory ?? []).find((row) => row.email === email.trim().toLowerCase());
        if (!user) return "That user is not on this phone.";
        if (!user.agreement) return "The agreement is not signed. Tick it before you allocate the shop.";
        set({ businesses: get().businesses.map((row) => row.id === id ? { ...row, ownerEmail: user.email, ownerName: user.name } : row), audit: [stamp(get().account?.email || "Super user", "Allocated business", id, user.email || ""), ...get().audit] });
        return `Allocated to ${user.name}.`;
      },
      requestAllocation: (kind, itemId, email) => {
        const account = get().account;
        if (!account) return "Sign in before you allocate.";
        const user = (get().directory ?? []).find((row) => row.email === email.trim().toLowerCase());
        const item = kind === "business" ? get().businesses.find((row) => row.id === itemId) : kind === "event" ? get().events.find((row) => row.id === itemId) : get().listings.find((row) => row.id === itemId);
        const name = item && "name" in item ? item.name : item && "title" in item ? item.title : "";
        if (!item || !user?.email || !name) return "Choose an item and a user.";
        const row = { id: crypto.randomUUID(), kind, businessId: itemId, businessName: name, userEmail: user.email, userName: user.name, from: account.email || account.name, status: "waiting" as const };
        set({ allocations: [row, ...(get().allocations ?? [])], audit: [stamp(account.email || account.name, "Requested allocation", name, user.email), ...get().audit] });
        return "Sent for approval.";
      },
      decideAllocation: (id, approve) => {
        if (get().account?.email?.toLowerCase() !== "dvmorris.dm@gmail.com") return "Only the super user can approve this.";
        const request = (get().allocations ?? []).find((row) => row.id === id);
        if (!request) return "That request is not here.";
        if (approve) {
          const user = (get().directory ?? []).find((row) => row.email === request.userEmail);
          const member = { email: request.userEmail, name: user?.name || request.userName, role: "owner" as const };
          const add = <T extends { id: string; ownerEmail?: string; ownerName?: string; staff?: { email: string; name: string; role: "owner" | "staff" }[] }>(rows: T[]) => rows.map((row) => row.id === request.businessId ? { ...row, ownerEmail: row.ownerEmail || member.email, ownerName: row.ownerName || member.name, staff: [...(row.staff ?? []).filter((person) => person.email !== member.email), member] } : row);
          set({
            businesses: request.kind === "event" || request.kind === "listing" ? get().businesses : add(get().businesses),
            events: request.kind === "event" ? add(get().events) : get().events,
            listings: request.kind === "listing" ? get().listings.map((row) => row.id === request.businessId ? { ...row, ownerEmail: member.email, ownerName: member.name } : row) : get().listings,
            allocations: (get().allocations ?? []).map((row) => row.id === id ? { ...row, status: "approved", decidedAt: new Date().toISOString() } : row),
            audit: [stamp(get().account?.email || "Super user", "Approved allocation", request.businessName, request.userEmail), ...get().audit],
          });
          return "Allocated.";
        }
        set({ allocations: (get().allocations ?? []).map((row) => row.id === id ? { ...row, status: "refused", decidedAt: new Date().toISOString() } : row), enquiries: [{ id: crypto.randomUUID(), businessId: request.kind === "business" ? request.businessId : "", from: request.userName, body: `${request.businessName}: Declined. The allocation was not approved.`, reply: "", at: new Date().toISOString(), read: false }, ...get().enquiries], audit: [stamp(get().account?.email || "Super user", "Refused allocation", request.businessName, request.userEmail), ...get().audit] });
        return "Refused.";
      },
      transferOwnership: (kind, itemId, email) => {
        const account = get().account;
        if (!account) return "Sign in before you allocate.";
        const user = (get().directory ?? []).find((row) => row.email === email.trim().toLowerCase());
        if (!user?.email) return "Choose a user.";
        const member = { email: user.email, name: user.name, role: "owner" as const };
        const actor = account.email || account.name;
        if (kind === "business") {
          const item = get().businesses.find((row) => row.id === itemId);
          if (!item) return "Choose a business.";
          set({ businesses: get().businesses.map((row) => row.id === itemId ? { ...row, ownerEmail: member.email, ownerName: member.name, staff: [...(row.staff ?? []).filter((person) => person.email !== member.email), member] } : row), audit: [stamp(actor, "Allocated business", item.name, member.email), ...get().audit] });
          return `Allocated ${item.name} to ${member.name}.`;
        }
        if (kind === "event") {
          const item = get().events.find((row) => row.id === itemId);
          if (!item) return "Choose an event.";
          set({ events: get().events.map((row) => row.id === itemId ? { ...row, ownerEmail: member.email, ownerName: member.name, staff: [...(row.staff ?? []).filter((person) => person.email !== member.email), member] } : row), audit: [stamp(actor, "Allocated event", item.title, member.email), ...get().audit] });
          return `Allocated ${item.title} to ${member.name}.`;
        }
        if (kind === "listing") {
          const item = get().listings.find((row) => row.id === itemId);
          if (!item) return "Choose a listing.";
          set({ listings: get().listings.map((row) => row.id === itemId ? { ...row, ownerEmail: member.email, ownerName: member.name } : row), audit: [stamp(actor, "Allocated listing", item.title, member.email), ...get().audit] });
          return `Allocated ${item.title} to ${member.name}.`;
        }
        const item = get().news.find((row) => row.id === itemId);
        if (!item) return "Choose a news article.";
        set({ news: get().news.map((row) => row.id === itemId ? { ...row, author: member.name, email: member.email } : row), audit: [stamp(actor, "Allocated news", item.title, member.email), ...get().audit] });
        return `Allocated ${item.title} to ${member.name}.`;
      },
      moderateEdit: (kind, id, patch) => {
        const account = get().account;
        const actor = account?.email || account?.name || "Admin";
        if (kind === "business") {
          set({ businesses: get().businesses.map((row) => row.id === id ? { ...row, name: patch.name || row.name, about: patch.about || row.about, address: patch.address || row.address, postcode: patch.postcode || row.postcode, phone: patch.phone || row.phone, email: patch.email || row.email, hours: patch.hours || row.hours, website: patch.website || row.website, category: patch.category || row.category, logo: patch.logo || row.logo, cover: patch.cover || row.cover, hero: patch.cover || row.hero, gallery: patch.gallery ? patch.gallery.split("|") : row.gallery } : row), audit: [stamp(actor, "Edited pending business", id, ""), ...get().audit] });
          return "Saved.";
        }
        if (kind === "event") {
          set({ events: get().events.map((row) => row.id === id ? { ...row, title: patch.title || row.title, detail: patch.detail || row.detail, when: patch.when || row.when, place: patch.place || row.place, address: patch.address || row.address, image: patch.image || row.image } : row), audit: [stamp(actor, "Edited pending event", id, ""), ...get().audit] });
          return "Saved.";
        }
        if (kind === "listing") {
          set({ listings: get().listings.map((row) => row.id === id ? { ...row, title: patch.title || row.title, detail: patch.detail || row.detail, priceLabel: patch.priceLabel || row.priceLabel, image: patch.image || row.image } : row), audit: [stamp(actor, "Edited pending listing", id, ""), ...get().audit] });
          return "Saved.";
        }
        set({ news: get().news.map((row) => row.id === id ? { ...row, title: patch.title || row.title, excerpt: patch.excerpt || row.excerpt, source: patch.source || row.source, image: patch.image || row.image } : row), audit: [stamp(actor, "Edited pending news", id, ""), ...get().audit] });
        return "Saved.";
      },
      assignEvent: (id, email) => {
        if (get().account?.email?.toLowerCase() !== "dvmorris.dm@gmail.com") return "Only the super user can allocate an event.";
        const user = (get().directory ?? []).find((row) => row.email === email.trim().toLowerCase());
        if (!user) return "That user is not on this phone.";
        if (!user.agreement) return "The agreement is not signed. Tick it before you allocate the event.";
        set({ events: get().events.map((row) => row.id === id ? { ...row, ownerEmail: user.email, ownerName: user.name } : row), audit: [stamp(get().account?.email || "Super user", "Allocated event", id, user.email || ""), ...get().audit] });
        return `Allocated to ${user.name}.`;
      },
      setAccount: (profile) => {
        const account = { id: profile.id || typeId("user"), ...profile, name: profile.name.trim(), email: profile.email?.trim().toLowerCase(), username: profile.email?.trim().toLowerCase(), over18: true as const };
        const directory = get().directory ?? [];
        const taken = directory.some((row) => row.email === account.email && row.email !== get().account?.email);
        if (taken) return;
        const rest = directory.filter((row) => row.email !== account.email);
        set({ account, directory: account.email ? [...rest, account] : directory, ageBlocked: false, ageOk: true, measures: { ...get().measures, signups: (get().measures?.signups ?? 0) + 1 } });
      },
      signInWithPassword: (username, password) => {
        const key = username.trim().toLowerCase();
        const failed = (get().failedLogins ?? {})[key];
        if (failed && failed.until > Date.now()) return "Too many tries. Wait 15 minutes.";
        const found = (get().directory ?? []).find((row) => row.username === key || row.email === key);
        if (!found) return "That email is not right. Please try again.";
        if (found.passwordHash && found.passwordHash !== password) {
          const count = (failed?.count ?? 0) + 1;
          set({ failedLogins: { ...(get().failedLogins ?? {}), [key]: { count, until: count >= 5 ? Date.now() + 15 * 60 * 1000 : 0 } } });
          return count >= 5 ? "Too many tries. Wait 15 minutes, then try again." : "That password is not right. Please try again.";
        }
        set({ account: found, ageBlocked: false, failedLogins: { ...(get().failedLogins ?? {}), [key]: { count: 0, until: 0 } } });
        return "";
      },
      requestErasure: () => {
        const account = get().account;
        if (!account?.email) return "Sign in first.";
        set({ account: null, directory: (get().directory ?? []).map((row) => row.email === account.email ? { ...row, name: "Removed", photo: "", note: "Erasure requested" } : row), audit: [stamp(account.email, "Erasure requested", account.email, "Personal fields removed. Trail kept."), ...get().audit] });
        return "Account deactivated. Personal fields are removed. Invoices and moderation rows are kept.";
      },
      requestReset: (username) => {
        const key = username.trim().toLowerCase();
        const found = (get().directory ?? []).find((row) => row.username === key || row.email === key);
        if (!found?.email) return "No account uses that email.";
        const token = crypto.randomUUID();
        set({ resets: [{ token, username: found.username || key, email: found.email }, ...(get().resets ?? [])] });
        return `Reset link queued from support@thecommon.community to ${found.email}. If the mailbox password is not on the server yet, use /reset?token=${token}`;
      },
      resetPassword: (token, password) => {
        const row = (get().resets ?? []).find((item) => item.token === token);
        if (!row) return "That reset link is not recognised.";
        set({ directory: (get().directory ?? []).map((item) => item.username === row.username || item.email === row.email ? { ...item, passwordHash: password } : item), resets: (get().resets ?? []).filter((item) => item.token !== token) });
        return "Password updated. You can log in.";
      },
      signIn: (email) => {
        const key = email.trim().toLowerCase();
        const found = (get().directory ?? []).find((row) => row.email === key);
        if (!found) return false;
        set({ account: found, ageBlocked: false });
        return true;
      },
      clearAccount: () => set({ account: null }),
      blockUnder18: () => set({ account: null, ageBlocked: true }),
      follow: (id) => {
        const { account, follows } = get();
        if (!account || follows.includes(id)) return;
        set({
          follows: [...follows, id],
          businesses: get().businesses.map((row) => (row.id === id ? { ...row, views: row.views } : row)),
        });
      },
      save: (id) => {
        const { account, saves } = get();
        if (!account || (saves ?? []).includes(id)) return;
        set({ saves: [...(saves ?? []), id] });
      },
      toggleSave: (id) => {
        const { account, saves } = get();
        if (!account) return false;
        const current = saves ?? [];
        set({ saves: current.includes(id) ? current.filter((row) => row !== id) : [...current, id] });
        return true;
      },
      toggleLike: (id) => {
        const { account, likes } = get();
        if (!account) return false;
        const current = likes ?? [];
        set({ likes: current.includes(id) ? current.filter((row) => row !== id) : [...current, id] });
        return true;
      },
      toggleFavourite: (id) => {
        const { account, favourites } = get();
        if (!account || account.membership === "viewer") return false;
        const current = favourites ?? [];
        const next = current.includes(id) ? current.filter((row) => row !== id) : [...current, id];
        set({ favourites: next, measures: { ...get().measures, favourites: next.length } });
        return true;
      },
      noteDirections: (id) => {
        set({
          businesses: get().businesses.map((row) =>
            row.id === id ? { ...row, directions: row.directions + 1, clicks: row.clicks + 1 } : row,
          ),
        });
      },
      rate: (businessId, stars) => {
        const account = get().account;
        if (!account || stars < 1 || stars > 5) return;
        const rest = get().ratings.filter((row) => !(row.businessId === businessId && row.accountName === account.name));
        set({ ratings: [...rest, { businessId, accountName: account.name, stars }] });
      },
      saveIndemnity: (input) => {
        const account = get().account;
        if (!account) return;
        const row: Indemnity = { ...input, id: crypto.randomUUID(), at: new Date().toISOString(), accountName: account.name };
        set({ indemnities: [row, ...(get().indemnities ?? [])] });
      },
      replyEnquiry: (id, reply) => {
        const row = get().enquiries.find((item) => item.id === id);
        set({ enquiries: get().enquiries.map((item) => item.id === id ? { ...item, reply, read: true } : item), messageLog: [{ id: crypto.randomUUID(), at: new Date().toISOString(), actor: get().account?.name || "Owner", action: "Replied", target: row?.from || "", body: reply }, ...(get().messageLog ?? [])] });
      },
      deleteMessages: (ids) => set({ enquiries: get().enquiries.filter((row) => !ids.includes(row.id)), listingMessages: (get().listingMessages ?? []).filter((row) => !ids.includes(row.id)), messageLog: [{ id: crypto.randomUUID(), at: new Date().toISOString(), actor: get().account?.name || "Owner", action: "Deleted messages", target: String(ids.length), body: "" }, ...(get().messageLog ?? [])] }),
      reportMessage: (input) => set({ messageReports: [{ id: crypto.randomUUID(), at: new Date().toISOString(), from: get().account?.name || "A neighbour", target: input.target, reason: input.reason, status: "open" }, ...(get().messageReports ?? [])] }),
      reviewReport: (id) => set({ messageReports: (get().messageReports ?? []).map((row) => row.id === id ? { ...row, status: "reviewed" } : row) }),
      watch: (target, reason) => set({ watchList: [{ id: crypto.randomUUID(), at: new Date().toISOString(), target, reason }, ...(get().watchList ?? [])], audit: [stamp(get().account?.email || "Admin", "Added to watch list", target, reason), ...get().audit] }),
      markEnquiryRead: (id) => set({ enquiries: get().enquiries.map((row) => row.id === id ? { ...row, read: true } : row) }),
      markListingRead: (id) => set({ listingMessages: (get().listingMessages ?? []).map((row) => row.id === id ? { ...row, read: true } : row) }),
      deleteEnquiry: (id) => set({ enquiries: get().enquiries.filter((row) => row.id !== id) }),
      replyListing: (id, reply) => set({ listingMessages: (get().listingMessages ?? []).map((row) => row.id === id ? { ...row, reply, read: true } : row) }),
      deleteListingMessage: (id) => set({ listingMessages: (get().listingMessages ?? []).filter((row) => row.id !== id) }),
      enquire: (businessId, body, eventId) => {
        const account = get().account;
        if (!account || !body.trim()) return;
        set({
          enquiries: [
            { id: crypto.randomUUID(), businessId, eventId, from: account.name, body: body.trim(), reply: "", at: new Date().toISOString(), read: false },
            ...get().enquiries,
          ],
          messageLog: [{ id: crypto.randomUUID(), at: new Date().toISOString(), actor: account.name, action: "Sent", target: eventId || businessId, body: body.trim() }, ...(get().messageLog ?? [])],
        });
      },
      requestBooking: (input) => {
        const account = get().account;
        if (!account) return { ok: false, reason: "An account is required." };
        if (!input.party.trim() || !input.when.trim()) return { ok: false, reason: "Choose what you want and a time." };
        const id = crypto.randomUUID();
        const code = ticketCode(id);
        const booking: Booking = {
          id,
          businessId: input.businessId,
          kind: input.kind,
          accountName: account.name,
          party: input.party.trim(),
          when: input.when.trim(),
          code,
        };
        set({
          bookings: [booking, ...get().bookings],
          enquiries: [{ id: crypto.randomUUID(), businessId: input.businessId, from: account.name, body: `Table request: ${input.party}, ${input.when}. Code: ${code}`, at: new Date().toISOString(), read: false, reply: "" }, ...get().enquiries],
        });
        return { ok: true, code };
      },
      postEvent: (input) => {
        const account = get().account;
        const business = get().businesses.find((row) => row.id === input.businessId);
        if (!account || !business || !ownsRecord(business, account) || business.status !== "published" || !input.title.trim() || !input.detail?.trim()) return false;
        const postcode = input.postcode || business.postcode;
        if (!isLambethPostcode(postcode)) return false;
        const area = areaFor(postcode);
        const event: LocalEvent = {
          id: typeId("event"),
          businessId: business.id,
          title: input.title.trim(),
          kind: input.kind ?? "Community",
          when: input.when.trim() || "Date to be set",
          date: input.when.trim() || "Date to be set",
          time: "",
          place: input.place || business.name,
          address: input.place || `${business.address}, ${business.postcode}`,
          postcode,
          website: input.website || "",
          phone: input.phone || "",
          email: input.email || "",
          tickets: input.tickets ? input.website || business.website || "tickets" : "",
          ticketPrice: 0,
          neighbourhood: area?.discoveryName ?? "",
          detail: input.detail?.trim() || "Submitted by the business. Waiting for an admin to approve it.",
          image: input.image || pictureFor(`${input.title} ${input.detail || ""} ${input.kind || ""}`, "event"),
          video: input.video || "",
          sample: false,
          capacity: 0,
          status: "pending",
          reason: "",
          ownerName: account.name,
          ownerEmail: account.email,
        };
        set({ events: [event, ...get().events], audit: [stamp(account.name, "Submitted event", event.title, business.name), ...get().audit] });
        return true;
      },
      postListing: (input) => {
        const account = get().account;
        if (!account || !input.title.trim()) return;
        const business = get().businesses.find((row) => row.id === input.businessId && row.status === "published");
        if (!account || !business || !input.title.trim() || !input.image) return;
        const listing: Listing = {
          id: typeId("listing"),
          businessId: business.id,
          kind: input.kind,
          title: input.title.trim(),
          detail: input.detail.trim() || `Listed by ${business.name}.`,
          category: input.category,
          subcategory: input.subcategory,
          listingType: input.listingType,
          condition: input.condition,
          priceBand: input.priceBand,
          priceLabel: input.priceLabel,
          image: input.image,
          video: input.video,
          publishedAt: new Date().toISOString(),
          status: "pending",
          ownerName: account.name,
          ownerEmail: account.email,
        };
        set({
          listings: [listing, ...get().listings],
          audit: [stamp(account.name, "Submitted listing", listing.title, business.name), ...get().audit],
        });
      },
      messageListing: (listingId, body) => {
        const account = get().account;
        const text = body.trim();
        const listing = visibleListings(get().listings).find((row) => row.id === listingId);
        const businessId = listing?.businessId;
        if (!account || !text || !businessId) return;
        const message: ListingMessage = { at: new Date().toISOString(), read: false, id: crypto.randomUUID(), listingId, from: account.name, body: text, reply: "" };
        set({ listingMessages: [message, ...(get().listingMessages ?? [])] });
      },
      submitCv: (listingId, fileName) => {
        const account = get().account;
        const name = fileName.trim();
        if (!account || !name) return false;
        const application: CvApplication = {
          id: crypto.randomUUID(),
          listingId,
          from: account.name,
          fileName: name,
          at: new Date().toISOString(),
        };
        set({ cvApplications: [application, ...(get().cvApplications ?? [])] });
        return true;
      },
      reserve: (eventId) => {
        const account = get().account;
        const event = get().events.find((row) => row.id === eventId);
        if (!account) return { ok: false, reason: "An account is required." };
        if (!event || event.status !== "published") return { ok: false, reason: "This event is not open." };
        const taken = get().reservations.filter((row) => row.eventId === eventId).length;
        const places = event.capacity > 0 ? event.capacity : 40;
        if (taken >= places) return { ok: false, reason: "This event is full. No further reservation is taken." };
        const existing = get().reservations.find((row) => row.eventId === eventId && row.accountName === account.name);
        if (existing) return { ok: true, code: existing.code };
        const id = crypto.randomUUID();
        const code = ticketCode(id);
        const reservation: Reservation = { id, eventId, accountName: account.name, code, scannedAt: null };
        set({ reservations: [...get().reservations, reservation] });
        return { ok: true, code };
      },
      report: (target, body, reason) => {
        const from = get().account?.name ?? "Guest";
        const id = `RPT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        set({
          reports: [{ id, target, from, body: reason ? `${reason}: ${body}` : body, status: "open", outcome: "", category: reason || "other", severity: reason?.toLowerCase().includes("under 18") || reason?.toLowerCase().includes("safeguard") ? "high" : "medium" }, ...get().reports],
        });
        return id;
      },
      block: (id) => set({ blocked: [...new Set([...(get().blocked ?? []), id])] }),
      unblock: (id) => set({ blocked: (get().blocked ?? []).filter((row) => row !== id) }),
      saveService: (id, patch) => set({ serviceEdits: { ...(get().serviceEdits ?? {}), [id]: { ...(get().serviceEdits ?? {})[id], ...patch } }, audit: [stamp(get().account?.email || "Desk", "Updated service", id, patch.name || ""), ...get().audit] }),
      hideService: (id) => set({ hiddenServices: [...new Set([...(get().hiddenServices ?? []), id])], audit: [stamp(get().account?.email || "Desk", "Removed service", id, ""), ...get().audit] }),
      submitNews: (input) => {
        const account = get().account;
        if (!account || !canAccess(account.email, account.kind, "journalist") || !input.title.trim() || !input.excerpt.trim()) return false;
        const item = { id: typeId("news"), source: input.source.trim() || account.name, title: input.title.trim(), excerpt: input.excerpt.trim(), href: input.href || "", neighbourhood: input.neighbourhood, image: input.image || pictureFor(`${input.title} ${input.excerpt}`, "news"), author: input.author || account.name, phone: input.phone || "", email: input.email || account.email, status: "pending" as const, reason: "" };
        set({ news: [item, ...get().news], audit: [stamp(account.email || account.name, "Submitted news", item.title, input.neighbourhood), ...get().audit], enquiries: [{ id: crypto.randomUUID(), businessId: "", from: account.name, body: `${item.title}: Sent for approval.`, reply: "", at: new Date().toISOString(), read: false }, ...get().enquiries], notifications: [{ id: crypto.randomUUID(), at: new Date().toISOString(), forRole: "admin", forName: "", body: `${account.name} submitted ${item.title}.`, read: false }, ...(get().notifications ?? [])] });
        return true;
      },
      requestNewsChange: (input) => {
        const account = get().account;
        const row = get().news.find((item) => item.id === input.newsId);
        if (!account || !row || (row.author !== account.name && row.email !== account.email)) return false;
        set({ newsRequests: [{ id: crypto.randomUUID(), newsId: row.id, action: input.action, title: input.title || row.title, excerpt: input.excerpt || row.excerpt, href: input.href || row.href, author: account.name, status: "pending" }, ...(get().newsRequests ?? [])], audit: [stamp(account.email || account.name, input.action === "delete" ? "Requested news deletion" : "Requested news edit", row.title, ""), ...get().audit], enquiries: [{ id: crypto.randomUUID(), businessId: "", from: account.name, body: `${row.title}: ${input.action === "delete" ? "Deletion" : "Edit"} sent for approval.`, reply: "", at: new Date().toISOString(), read: false }, ...get().enquiries], notifications: [{ id: crypto.randomUUID(), at: new Date().toISOString(), forRole: "admin", forName: "", body: `${account.name} asked to ${input.action} ${row.title}.`, read: false }, ...(get().notifications ?? [])] });
        return true;
      },
      decideNewsChange: (id, approve, reason) => {
        const request = (get().newsRequests ?? []).find((row) => row.id === id);
        if (!request) return;
        const news = get().news.map((row) => row.id !== request.newsId ? row : approve && request.action === "edit" ? { ...row, title: request.title, excerpt: request.excerpt, href: request.href } : row).filter((row) => !(approve && request.action === "delete" && row.id === request.newsId));
        set({ news, newsRequests: (get().newsRequests ?? []).map((row) => row.id === id ? { ...row, status: approve ? "approved" : "refused" } : row), audit: [stamp(get().account?.email || "Admin", approve ? "Approved news change" : "Declined news change", request.title, reason), ...get().audit], enquiries: [{ id: crypto.randomUUID(), businessId: "", from: request.author, body: `${request.title}: ${approve ? "Approved" : "Declined"}. ${reason}`, reply: "", at: new Date().toISOString(), read: false }, ...get().enquiries], notifications: [{ id: crypto.randomUUID(), at: new Date().toISOString(), forRole: "journalist", forName: request.author, body: `${request.title}: ${approve ? "Approved" : "Declined"}. ${reason}`, read: false }, ...(get().notifications ?? [])] });
      },
      markNotificationRead: (id) => set({ notifications: (get().notifications ?? []).map((row) => row.id === id ? { ...row, read: true } : row) }),
      requestTransport: (note) => {
        const account = get().account;
        if (!account) return "Sign in first.";
        set({ transportNote: note.trim(), audit: [stamp(account.email || account.name, "Submitted transport change", "TfL", note.trim()), ...get().audit] });
        return "Sent to the super user.";
      },
      fileCouncilNote: (input) => {
        const account = get().account;
        const note = { id: crypto.randomUUID(), at: new Date().toISOString(), kind: input.kind, neighbourhood: input.neighbourhood, body: input.body.trim(), name: input.name.trim() || account?.name || "A neighbour" };
        set({ councilNotes: [note, ...(get().councilNotes ?? [])], audit: [stamp(note.name, "Council note", input.kind, input.neighbourhood), ...get().audit] });
      },
      fileIncident: (input) => {
        const incident: Incident = {
          id: crypto.randomUUID(),
          at: new Date().toISOString(),
          neighbourhood: input.neighbourhood,
          service: input.service,
          description: input.description.trim(),
          anonymous: input.anonymous,
          name: input.anonymous ? "" : input.name.trim(),
          imageName: input.imageName,
        };
        set({ incidents: [incident, ...(get().incidents ?? [])], audit: [stamp(input.anonymous ? "Anonymous" : input.name || "Resident", "Filed incident", input.service, input.neighbourhood), ...get().audit] });
      },
      submitBusiness: (input) => {
        const account = get().account;
        if (!account) return "";
        const id = typeId("business");
        const business: Business = {
          id,
          name: input.name,
          category: "Independent",
          trade: "hospitality",
          shelf: "menu",
          address: input.address,
          postcode: input.postcode.toUpperCase(),
          lat: 51.4613,
          lng: -0.138,
          phone: input.phone,
          email: input.email,
          hours: input.hours,
          about: "Submitted in the Stage 0 preview. Not public until a person approves it.",
          website: "",
          services: [],
          menu: [],
          menuNote: "",
          access: "not_stated",
          proof: "Not yet checked.",
          status: "pending",
          reason: "",
          appeal: "none",
          ownerName: account.name,
          ownerEmail: account.email,
          views: 0,
          clicks: 0,
          directions: 0,
        };
        set({
          businesses: [business, ...get().businesses],
          audit: [stamp("Owner", "Submitted", business.name, ""), ...get().audit],
        });
        return id;
      },

      issueClaim: (id) => {
        const account = get().account;
        if (account?.email?.toLowerCase() !== "dvmorris.dm@gmail.com") return "";
        const code = Math.random().toString(36).slice(2, 8).toUpperCase();
        set({ businesses: get().businesses.map((row) => (row.id === id ? { ...row, claimCode: code } : row)) });
        return code;
      },
      claimBusiness: (code) => {
        const account = get().account;
        if (!account?.email) return "Sign in before you claim a business.";
        const key = code.trim().toUpperCase();
        const found = get().businesses.find((row) => row.claimCode === key);
        if (!found) return "That code is not recognised.";
        set({
          businesses: get().businesses.map((row) => row.id === found.id ? { ...row, ownerEmail: account.email?.toLowerCase(), ownerName: account.name, claimCode: undefined } : row),
          audit: [stamp(account.email || account.name, "Claimed business", found.name, "Code used"), ...get().audit],
        });
        return `Claimed ${found.name}.`;
      },

      setMember: (kind, id, email, role, duty) => {
        const account = get().account;
        const user = (get().directory ?? []).find((row) => row.email === email.trim().toLowerCase());
        if (!user?.email) return "That person is not on this phone.";
        const member = { email: user.email, name: user.name, role, duty };
        if (kind === "business") {
          const row = get().businesses.find((item) => item.id === id);
          if (!row || (account?.email?.toLowerCase() !== "dvmorris.dm@gmail.com" && row.ownerEmail !== account?.email && !(row.staff ?? []).some((person) => person.email === account?.email && person.role === "owner"))) return "Only an owner can add a person.";
          set({ businesses: get().businesses.map((item) => item.id === id ? { ...item, staff: [...(item.staff ?? []).filter((person) => person.email !== user.email), member] } : item), audit: [stamp(account?.email || "Owner", "Added member", row.name, user.email + " " + role), ...get().audit] });
          return "Added.";
        }
        const row = get().events.find((item) => item.id === id);
        if (!row || (account?.email?.toLowerCase() !== "dvmorris.dm@gmail.com" && row.ownerEmail !== account?.email)) return "Only an owner can add a person.";
        set({ events: get().events.map((item) => item.id === id ? { ...item, staff: [...(item.staff ?? []).filter((person) => person.email !== user.email), member] } : item), audit: [stamp(account?.email || "Owner", "Added member", row.title, user.email + " " + role), ...get().audit] });
        return "Added.";
      },
      removeMember: (kind, id, email) => {
        const account = get().account;
        const key = email.trim().toLowerCase();
        if (kind === "business") {
          const row = get().businesses.find((item) => item.id === id);
          if (!row || (account?.email?.toLowerCase() !== "dvmorris.dm@gmail.com" && row.ownerEmail !== account?.email)) return "Only an owner can remove a person.";
          set({ businesses: get().businesses.map((item) => item.id === id ? { ...item, staff: (item.staff ?? []).filter((person) => person.email !== key) } : item), audit: [stamp(account?.email || "Owner", "Removed member", row.name, key), ...get().audit] });
          return "Removed.";
        }
        const row = get().events.find((item) => item.id === id);
        if (!row || (account?.email?.toLowerCase() !== "dvmorris.dm@gmail.com" && row.ownerEmail !== account?.email)) return "Only an owner can remove a person.";
        set({ events: get().events.map((item) => item.id === id ? { ...item, staff: (item.staff ?? []).filter((person) => person.email !== key) } : item), audit: [stamp(account?.email || "Owner", "Removed member", row.title, key), ...get().audit] });
        return "Removed.";
      },
      updateBusiness: (id, input) => {
        const account = get().account;
        set({
          businesses: get().businesses.map((row) => {
            if (row.id !== id) return row;
            if (account?.email?.toLowerCase() !== "dvmorris.dm@gmail.com" && row.ownerEmail !== account?.email && row.ownerName !== account?.name) return row;
            if (!isLambethPostcode(input.postcode)) return row;
            if (row.status === "published") return { ...row, bookings: input.bookings ?? row.bookings, appointments: input.appointments ?? row.appointments, chatOn: input.chatOn ?? row.chatOn, revision: { about: input.about, phone: input.phone, address: input.address } };
            return { ...row, ...input, postcode: input.postcode.toUpperCase() };
          }),
          audit: [stamp(account?.email || account?.name || "Owner", "Submitted revision", id, "Live copy stays up"), ...get().audit],
        });
      },
      removeEvent: (id) => set({ events: get().events.filter((row) => row.id !== id), audit: [stamp(get().account?.email || "Admin", "Removed event", id, ""), ...get().audit] }),
      removeListing: (id) => set({ listings: get().listings.filter((row) => row.id !== id), audit: [stamp(get().account?.email || "Admin", "Removed listing", id, ""), ...get().audit] }),
      removeOffer: (id) => set({ offers: (get().offers ?? []).filter((row) => row.id !== id), audit: [stamp(get().account?.email || "Admin", "Removed offer", id, ""), ...get().audit] }),
      updateEvent: (id, input) => {
        set({
          events: get().events.map((row) =>
            row.id === id ? { ...row, ...input, image: input.image || row.image || pictureFor(`${input.title || row.title} ${input.kind || row.kind} ${input.detail || row.detail || ""}`, "event"), status: row.status === "published" ? "pending" : row.status, reason: row.status === "published" ? "Edited by the owner. Waiting for admin." : row.reason } : row,
          ),
          audit: [stamp(get().account?.email || "Admin", "Edited event", id, ""), ...get().audit],
        });
      },
      saveOffer: (businessId, input) => {
        const offers = get().offers ?? [];
        if (input.id) {
          set({ offers: offers.map((row) => row.id === input.id ? { ...row, ...input, image: input.image || row.image, upload: input.image || row.upload } : row), audit: [stamp(get().account?.email || "Admin", "Edited offer", input.id, ""), ...get().audit] });
          return;
        }
        set({ offers: [{ id: crypto.randomUUID(), businessId, title: input.title, detail: input.detail, price: input.price, image: input.image || pictureFor(`${input.title} ${input.detail}`, "business"), upload: input.image, status: "published" }, ...offers], audit: [stamp(get().account?.email || "Admin", "Added offer", businessId, input.title), ...get().audit] });
      },
      resubmit: (id) => {
        set({
          businesses: get().businesses.map((row) =>
            row.id === id ? { ...row, status: "pending", reason: "", appeal: "none" } : row,
          ),
        });
      },
      recommend: (kind, id, status, reason, actor) => {
        const note = reason.trim();
        if (!note) return;
        const row = { id: typeId("audit"), kind, itemId: id, status, reason: note, by: actor, at: new Date().toISOString() };
        set({
          submissions: [row, ...(get().submissions ?? []).filter((item) => !(item.kind === kind && item.itemId === id))],
          audit: [stamp(actor, "Submitted for approval", id, `${status}: ${note}`), ...get().audit],
          enquiries: [{ id: crypto.randomUUID(), businessId: "", from: actor, body: `${kind} submitted as ${status}. ${note}`, reply: "", at: new Date().toISOString(), read: false }, ...get().enquiries],
        });
      },
      decide: (kind, id, status, reason, actor, checks) => {
        const owner = kind === "business" ? get().businesses.find((row) => row.id === id)?.ownerEmail
          : kind === "event" ? get().events.find((row) => row.id === id)?.ownerEmail
          : kind === "listing" ? get().listings.find((row) => row.id === id)?.ownerEmail
          : get().news.find((row) => row.id === id)?.email;
        if (owner && actor && owner.toLowerCase() === actor.toLowerCase()) {
          set({ audit: [stamp(actor, "Blocked self-approval", id, "Four-eyes. A person cannot approve their own item."), ...get().audit] });
          return;
        }
        set({ submissions: (get().submissions ?? []).filter((row) => !(row.kind === kind && row.itemId === id)) });
        const entry = stamp(actor || "Stage 0 reviewer", "Approval " + status, id, reason);
        const checksText = checks?.length ? `\n${checks.map((item) => `• ${item.replace(": Yes", ": Passed").replace(": No", ": Failed")}`).join("\n")}` : "";
        const outcome = status === "published" ? "Approved" : status === "refused" ? "Declined" : "Approved with changes";
        const note = { id: crypto.randomUUID(), businessId: "", from: actor || "Admin", body: `Decision: ${outcome}. ${reason || "No comment added."}${checksText}\nYou can reply to this message to discuss the decision.`, reply: "", at: new Date().toISOString(), read: false };
        if (kind === "business") {
          const row = get().businesses.find((item) => item.id === id);
          set({
            businesses: get().businesses.map((item) => (item.id === id ? { ...item, status, reason, about: status === "published" && item.revision?.about ? item.revision.about : item.about, phone: status === "published" && item.revision?.phone ? item.revision.phone : item.phone, address: status === "published" && item.revision?.address ? item.revision.address : item.address, revision: undefined, trialEnds: status === "published" ? item.trialEnds || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) : item.trialEnds } : item)),
            audit: [entry, ...get().audit],
            enquiries: [{ ...note, businessId: id, from: "Admin", body: `${row?.name || "Your page"}: ${note.body}` }, ...get().enquiries],
          });
        } else if (kind === "event") {
          const row = get().events.find((item) => item.id === id);
          set({
            events: get().events.map((item) => (item.id === id ? { ...item, status, reason } : item)),
            audit: [entry, ...get().audit],
            enquiries: [{ ...note, businessId: row?.businessId || "", eventId: id, body: `${row?.title || "Your event"}: ${note.body}` }, ...get().enquiries],
          });
        } else if (kind === "listing") {
          const row = get().listings.find((item) => item.id === id);
          set({
            listings: get().listings.map((item) => (item.id === id ? { ...item, status, reason } : item)),
            audit: [entry, ...get().audit],
            enquiries: [{ ...note, businessId: row?.businessId || "", body: `${row?.title || "Your listing"}: ${note.body}` }, ...get().enquiries],
          });
        } else {
          const row = get().news.find((item) => item.id === id);
          set({
            news: get().news.map((item) => (item.id === id ? { ...item, status, reason } : item)),
            audit: [entry, ...get().audit],
            enquiries: [{ ...note, from: row?.author || "Admin", body: `${row?.title || "Your story"}: ${note.body}` }, ...get().enquiries],
          });
        }
      },
      appeal: (id) => {
        set({
          businesses: get().businesses.map((row) =>
            row.id === id ? { ...row, appeal: "waiting" } : row,
          ),
          audit: [stamp("Owner", "Appeal opened", id, "Waiting for a decision-maker. The seats are empty."), ...get().audit],
        });
      },
      settleAppeal: (id, outcome, actor) => {
        const row = get().businesses.find((item) => item.id === id);
        const wording = outcome === "upheld" ? "Your appeal was upheld. The page is published." : outcome === "sent_back" ? "Your appeal was sent back. Please edit and resubmit." : "Your appeal was reviewed.";
        set({
          businesses: get().businesses.map((item) => {
            if (item.id !== id) return item;
            if (outcome === "upheld") return { ...item, appeal: "upheld", status: "published", reason: "" };
            if (outcome === "sent_back") return { ...item, appeal: "sent_back", status: "changes_requested" };
            return { ...item, appeal: "substituted" };
          }),
          enquiries: [{ id: crypto.randomUUID(), businessId: id, from: actor || "Admin", body: `${row?.name || "Your page"}: ${wording}`, reply: "", at: new Date().toISOString(), read: false }, ...get().enquiries],
          audit: [stamp(actor, `Appeal ${outcome}`, id, wording), ...get().audit],
        });
      },
      updateCase: (id, patch) => {
        const actor = get().account?.email || "Admin";
        set({ reports: get().reports.map((row) => row.id === id ? { ...row, ...patch, updatedAt: new Date().toISOString() } : row), audit: [stamp(actor, "Updated case", id, patch.notes || patch.outcome || patch.severity || "case note"), ...get().audit] });
      },
      closeReport: (id, outcome, actor) => {
        const report = get().reports.find((row) => row.id === id);
        const serious = /child|threat|crime|abuse|weapon/i.test(report?.body || "");
        const superUser = get().account?.email?.toLowerCase() === "dvmorris.dm@gmail.com";
        if (serious && !superUser) {
          set({ audit: [stamp(actor || "Admin", "Escalated report", id, "Waiting for the super user"), ...get().audit] });
          return "Sent to the super user. Admin cannot close this report.";
        }
        set({
          reports: get().reports.map((row) => (row.id === id ? { ...row, status: "closed", outcome } : row)),
          audit: [stamp(actor || "Stage 0 reviewer", "Report closed", id, outcome), ...get().audit],
        });
        return "Closed. The item stays up unless a separate decision removes it.";
      },
      scan: (code, eventId) => {
        const reservation = get().reservations.find((row) => row.code === code.trim() && row.eventId === eventId);
        if (!reservation) return { ok: false, reason: "That code is not a reservation for this event." };
        if (reservation.scannedAt) return { ok: false, reason: "Already counted. A second scan does not let them in again." };
        set({
          reservations: get().reservations.map((row) =>
            row.id === reservation.id ? { ...row, scannedAt: new Date().toISOString() } : row,
          ),
        });
        return { ok: true, name: reservation.accountName };
      },
      scanByName: (name, eventId) => {
        const needle = name.trim().toLowerCase();
        const reservation = get().reservations.find((row) => row.accountName.toLowerCase() === needle && row.eventId === eventId);
        if (!reservation) return { ok: false, reason: "No reservation under that name for this event." };
        if (reservation.scannedAt) return { ok: false, reason: "Already counted under that name." };
        set({
          reservations: get().reservations.map((row) =>
            row.id === reservation.id ? { ...row, scannedAt: new Date().toISOString() } : row,
          ),
        });
        return { ok: true, name: reservation.accountName };
      },
      requestRole: (email, patch, duties) => {
        const account = get().account;
        const user = (get().directory ?? []).find((row) => row.email === email);
        if (!account || !user) return "Choose a person.";
        const row = { id: crypto.randomUUID(), email, name: user.name, detail: patch.kind || (duties ? duties.join(", ") : "profile"), patch, duties, from: account.email || account.name, status: "waiting" as const };
        set({ roleRequests: [row, ...(get().roleRequests ?? [])], audit: [stamp(account.email || account.name, "Submitted role change", email, row.detail), ...get().audit] });
        return "Sent to the super user.";
      },
      decideRole: (id, approve) => {
        if (get().account?.email?.toLowerCase() !== "dvmorris.dm@gmail.com") return "Only the super user can approve this.";
        const request = (get().roleRequests ?? []).find((row) => row.id === id);
        if (!request) return "That request is not here.";
        if (!approve) {
          set({ roleRequests: (get().roleRequests ?? []).map((row) => row.id === id ? { ...row, status: "refused" } : row), enquiries: [{ id: crypto.randomUUID(), businessId: "", from: request.name, body: `Role change declined. ${request.detail}`, reply: "", at: new Date().toISOString(), read: false }, ...get().enquiries], audit: [stamp(get().account?.email || "Super user", "Refused role change", request.email, request.detail), ...get().audit] });
          return "Refused.";
        }
        set({
          directory: (get().directory ?? []).map((row) => row.email === request.email ? { ...row, ...request.patch } : row),
          staffGrants: request.duties ? [...(get().staffGrants ?? []).filter((row) => row.email !== request.email), { email: request.email, duties: request.duties as never }] : get().staffGrants,
          roleRequests: (get().roleRequests ?? []).map((row) => row.id === id ? { ...row, status: "approved" } : row), enquiries: [{ id: crypto.randomUUID(), businessId: "", from: request.name, body: `Role change approved. ${request.detail}`, reply: "", at: new Date().toISOString(), read: false }, ...get().enquiries],
          audit: [stamp(get().account?.email || "Super user", "Approved role change", request.email, request.detail), ...get().audit],
        });
        return "Approved.";
      },
      flagAge: (id, reason) => {
        const row = (get().ageDeclarations ?? []).find((item) => item.id === id);
        set({ ageDeclarations: (get().ageDeclarations ?? []).map((item) => item.id === id ? { ...item, status: "Flagged" } : item), audit: [stamp(get().account?.email || "Admin", "AGE_FLAGGED", id, reason), ...get().audit] });
      },
      confirmAdult: (id, reason) => {
        set({ ageDeclarations: (get().ageDeclarations ?? []).map((item) => item.id === id ? { ...item, status: "Confirmed adult" } : item), audit: [stamp(get().account?.email || "Admin", "AGE_CONFIRMED_ADULT", id, reason), ...get().audit] });
      },
      removeAgeAccount: (id, reason) => {
        const row = (get().ageDeclarations ?? []).find((item) => item.id === id);
        set({ ageDeclarations: (get().ageDeclarations ?? []).map((item) => item.id === id ? { ...item, status: "Account removed", username: "Removed" } : item), directory: (get().directory ?? []).map((item) => item.email === row?.username ? { ...item, name: "Removed", note: "Age removal" } : item), audit: [stamp(get().account?.email || "Super user", "AGE_ACCOUNT_REMOVED", id, reason), ...get().audit] });
      },
      setStaffGrant: (email, duties) => {
        const key = email.trim().toLowerCase();
        if (!key || key === SUPER_EMAIL) return;
        const rest = (get().staffGrants ?? []).filter((row) => row.email !== key);
        set({
          staffGrants: duties.length ? [...rest, { email: key, duties }] : rest,
          audit: [stamp(SUPER_EMAIL, duties.length ? "Allocated staff desks" : "Removed staff desks", key, duties.join(", ") || "none"), ...get().audit],
        });
      },
    }),
    { name: "the-common-stage0", version: 28, merge: (persisted, current) => {
      const saved = (persisted ?? {}) as Partial<CommonState>;
      const events = Array.isArray(saved.events) ? saved.events : [];
      const seedIds = new Set(SEED_EVENTS.map((row) => row.id));
      const demoBusinesses = new Set(SEED_BUSINESSES.map((row) => row.id));
      const directory = Array.isArray(saved.directory) ? saved.directory : [];
      if (saved.account?.email && !directory.some((row) => row.email === saved.account?.email)) directory.push(saved.account);
      if (!directory.some((row) => row.email === DEMO_OWNER_EMAIL)) directory.push(DEMO_ACCOUNT);
      for (const row of directory) if (row.email === DEMO_OWNER_EMAIL) row.passwordHash = "Common2026";
      for (const row of directory) if (row.email === "owen@test.common") row.passwordHash = row.passwordHash || "Journal1";
      for (const row of directory) if (!row.id || !row.id.startsWith("usr_")) row.id = row.email === DEMO_OWNER_EMAIL ? "usr_super" : typeId("user");
      for (const user of TEST_USERS) if (!directory.some((row) => row.email === user.email)) directory.push(user);
      const businesses = Array.isArray(saved.businesses) ? saved.businesses : current.businesses;
      const demoSignedIn = saved.account?.email === DEMO_OWNER_EMAIL;
      const demoName = saved.account?.name || DEMO_ACCOUNT.name;
      const enquiries = Array.isArray(saved.enquiries) && saved.enquiries.length ? saved.enquiries : current.enquiries;
      const follows = demoSignedIn && !(saved.follows ?? []).length ? ["biz_f4393427-4b76-e6d7-54b8-870177dfa5b6", "biz_536c0361-26a6-fac0-d864-fd72ce9e95b0", "biz_f16ac2ca-1bce-371e-4ec7-35ed623bc135"] : saved.follows ?? [];
      const saves = demoSignedIn && !(saved.saves ?? []).length ? ["evt_7ec54afb-ac4c-ce61-5097-c16a4ec25850", "evt_7c4a760b-bf68-0608-3660-7f35d0fdaf37", "evt_682bbc56-9b85-8094-cede-4d1fa42c6680"] : saved.saves ?? [];
      const likes = demoSignedIn && !(saved.likes ?? []).length ? ["nws_d0430009-d906-51f7-7316-ae9fe2e2de85", "biz_f4393427-4b76-e6d7-54b8-870177dfa5b6", "evt_7ec54afb-ac4c-ce61-5097-c16a4ec25850"] : saved.likes ?? [];
      const favourites = demoSignedIn && !(saved.favourites ?? []).length ? ["nws_741b3748-7f3a-584e-8a9b-c17331c51e36", "biz_536c0361-26a6-fac0-d864-fd72ce9e95b0", "evt_7c4a760b-bf68-0608-3660-7f35d0fdaf37"] : saved.favourites ?? [];
      const reservations = Array.isArray(saved.reservations) ? saved.reservations : current.reservations;
      const withHold = demoSignedIn && !reservations.some((row) => row.accountName === demoName)
        ? [{ id: "demo-super-hold", eventId: "evt_7ec54afb-ac4c-ce61-5097-c16a4ec25850", accountName: demoName, code: ticketCode("demo-super-hold"), scannedAt: null }, ...reservations]
        : reservations;
      return {
        ...current,
        ...saved,
        failedLogins: {},
        directory,
        follows,
        saves,
        likes,
        favourites,
        reservations: withHold,
        businesses: [...current.businesses.filter((row) => !businesses.some((savedRow) => savedRow.id === row.id)), ...stampDemo(businesses, demoBusinesses)],
        events: [
          ...current.events.filter((row) => !events.some((savedRow) => savedRow.id === row.id)),
          ...stampDemo(SEED_EVENTS, seedIds),
          ...events.filter((row) => !seedIds.has(row.id) && row.id !== "saturday-loaf"),
        ],
        listings: [...current.listings.filter((row) => !(saved.listings ?? []).some((savedRow) => savedRow.id === row.id)), ...(saved.listings ?? [])],
        serviceEdits: { ...current.serviceEdits, ...(saved.serviceEdits ?? {}) },
      };
    }, migrate: (persisted, version) => {
      const state = persisted as {
        reservations?: Reservation[];
        businesses?: Business[];
        offers?: Offer[];
        events?: LocalEvent[];
        follows?: string[];
        saves?: string[];
        likes?: string[];
        favourites?: string[];
        news?: NewsItem[];
        bookings?: Booking[];
        listings?: Listing[];
        ratings?: Rating[];
      };
      if (version < 1 && (!state.reservations || state.reservations.length === 0)) {
        state.reservations = SEED_HOLDS;
      }
      if (version < 3) {
        const demoIds = new Set(SEED_BUSINESSES.map((row) => row.id));
        const offerIds = new Set(SEED_OFFERS.map((row) => row.id));
        state.businesses = [
          ...SEED_BUSINESSES,
          ...(state.businesses ?? []).filter((row) => row.id !== "hearth" && !demoIds.has(row.id)),
        ];
        state.offers = [
          ...SEED_OFFERS,
          ...(state.offers ?? []).filter((row) => row.businessId !== "hearth" && row.id !== "mkt_df3d749f-e786-1aab-1b51-7758591208e1" && !offerIds.has(row.id)),
        ];
        state.events = (state.events ?? []).map((row) => {
          if (row.id === "saturday-loaf") return { ...SEED_EVENTS[0], id: "saturday-loaf" };
          if (row.businessId === "hearth") return { ...row, businessId: "biz_f4393427-4b76-e6d7-54b8-870177dfa5b6" };
          return row;
        });
        state.follows = (state.follows ?? []).map((id) => (id === "hearth" ? "biz_f4393427-4b76-e6d7-54b8-870177dfa5b6" : id));
        state.news = (state.news ?? []).map((row) => (row.id === "news-live" ? SEED_NEWS[0] : row));
      }
      if (version < 4) {
        state.news = (state.news ?? SEED_NEWS).map((row) => {
          const seed = SEED_NEWS.find((item) => item.id === row.id);
          return seed ? { ...row, image: seed.image, neighbourhood: row.neighbourhood || seed.neighbourhood } : row;
        });
      }
      if (version < 9) {
        reseedBusinesses(state);
        state.news = SEED_NEWS;
        state.bookings = state.bookings ?? [];
        state.listings = state.listings ?? [];
      }
      if (version < 10) reseedOffers(state);
      if (version < 11) {
        reseedBusinesses(state);
        state.ratings = state.ratings ?? [];
      }
      if (version < 12) reseedBusinesses(state);
      if (version < 13) reseedOffers(state);
      
      if (version < 22) {
        if (Array.isArray(state.businesses) && state.businesses.some((row) => !String(row.id).includes("_"))) {
          state.businesses = SEED_BUSINESSES;
        }
        if (Array.isArray(state.events) && state.events.some((row) => !String(row.id).includes("_"))) {
          state.events = SEED_EVENTS;
        }
        if (Array.isArray(state.news) && state.news.some((row) => !String(row.id).includes("_"))) {
          state.news = SEED_NEWS;
        }
        if (Array.isArray(state.offers) && state.offers.some((row) => !String(row.id).includes("_"))) {
          state.offers = SEED_OFFERS;
        }
        if (Array.isArray(state.listings) && state.listings.some((row) => !String(row.id).includes("_"))) {
          state.listings = [];
        }
      }

      if (version < 21) {
        const desk = state as typeof state & { reports?: unknown[]; audit?: unknown[]; messageReports?: unknown[]; listings?: { id: string }[]; news?: { id: string }[]; businesses?: { id: string }[] };
        if (!desk.reports || desk.reports.length === 0) desk.reports = SEED_REPORTS as never;
        if (!desk.audit || desk.audit.length === 0) desk.audit = SEED_AUDIT as never;
        if (!desk.messageReports || desk.messageReports.length === 0) desk.messageReports = SEED_FLAGS as never;
        desk.businesses = desk.businesses || [];
        if (!desk.businesses.some((row) => row.id === "biz_29be9778-54b0-670a-263c-a8edbad4cae7")) desk.businesses.push({ id: "biz_29be9778-54b0-670a-263c-a8edbad4cae7", name: "Clapham Cut", category: "Barber", trade: "service", shelf: "services", address: "12 Clapham High Street", postcode: "SW4 7UL", lat: 51.462, lng: -0.138, phone: "020 7000 0000", email: "hello@claphamcut.test", hours: "Tue–Sat 9:00–18:00", about: "A new barber waiting for a first check.", website: "", services: ["Cut"], menu: [], menuNote: "", access: "not_stated", proof: "Companies House not checked.", status: "pending", reason: "", appeal: "none", views: 0, clicks: 0, directions: 0, ownerEmail: "buddy@buddys.test" } as never);
        if (!desk.businesses.some((row) => row.id === "biz_8b3d7b92-d44b-1b5a-13e2-89f45021f946")) desk.businesses.push({ id: "biz_8b3d7b92-d44b-1b5a-13e2-89f45021f946", name: "Northcote Kiosk", category: "Cafe", trade: "hospitality", shelf: "menu", address: "4 Northcote Road", postcode: "SW11 1NT", lat: 51.46, lng: -0.166, phone: "020 7000 0001", email: "hi@kiosk.test", hours: "Daily 8:00–16:00", about: "Declined for a lookalike name. Appeal waiting.", website: "", services: [], menu: [], menuNote: "", access: "not_stated", proof: "", status: "refused", reason: "D06: The name matches another page.", appeal: "waiting", views: 0, clicks: 0, directions: 0, ownerEmail: "buddy@buddys.test" } as never);
        desk.listings = desk.listings || [];
        if (!desk.listings.some((row) => row.id === "mkt_9118f771-3322-c5be-0163-027c30bc52e0")) desk.listings.push({ id: "mkt_9118f771-3322-c5be-0163-027c30bc52e0", businessId: "", kind: "equipment", title: "Free sofa", detail: "Two-seat sofa, collect from Clapham.", status: "pending", category: "Home & Garden" } as never);
        desk.news = desk.news || [];
        if (!desk.news.some((row) => row.id === "nws_b2162f3a-2692-b73d-9841-6c240aa7c04f")) desk.news.push({ id: "nws_b2162f3a-2692-b73d-9841-6c240aa7c04f", source: "Local reporter", title: "Saturday market on Acre Lane", excerpt: "A short note about a Saturday stall.", href: "", neighbourhood: "Clapham", posted: "13 October 2026, 9.00am", status: "pending", reason: "" } as never);
      }
      
      if (version < 16) {
        const seedIds = new Set(SEED_EVENTS.map((row) => row.id));
        const current = state.events ?? [];
        state.events = [...SEED_EVENTS, ...current.filter((row) => !seedIds.has(row.id) && row.id !== "saturday-loaf")];
      }
      if (version < 17) reseedBusinesses(state);
      if (version < 18) state.likes = state.likes ?? [];
      if (version < 19) state.favourites = state.favourites ?? [];
      if (version < 23) {
        const people = (state as { directory?: Account[]; account?: Account }).directory ?? [];
        for (const row of people) if (!row.id || !row.id.startsWith("usr_")) row.id = row.email === DEMO_OWNER_EMAIL ? "usr_super" : typeId("user");
        for (const row of state.businesses ?? []) if (!row.id?.startsWith("biz_")) row.id = typeId("business");
        for (const row of state.events ?? []) if (!row.id?.startsWith("evt_")) row.id = typeId("event");
        for (const row of state.news ?? []) if (!row.id?.startsWith("nws_")) row.id = typeId("news");
        for (const row of state.listings ?? []) if (!row.id?.startsWith("mkt_")) row.id = typeId("listing");
      }
      return state;
    } },
  ),
);

function reseedBusinesses(state: { businesses?: Business[] }) {
  const demo = new Map(SEED_BUSINESSES.map((row) => [row.id, row]));
  const extras = (state.businesses ?? []).filter((row) => !demo.has(row.id) && row.id !== "hearth");
  state.businesses = [...SEED_BUSINESSES, ...extras];
}

function reseedOffers(state: { offers?: Offer[] }) {
  const seed = new Map(SEED_OFFERS.map((row) => [row.id, row]));
  const current = state.offers ?? [];
  state.offers = [
    ...SEED_OFFERS.map((row) => {
      const previous = current.find((item) => item.id === row.id);
      return previous?.upload ? { ...row, upload: previous.upload } : row;
    }),
    ...current.filter((row) => !seed.has(row.id)),
  ];
}

export function placesTaken(reservations: Reservation[], eventId: string) {
  return reservations.filter((row) => row.eventId === eventId).length;
}
