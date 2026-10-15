/** Neighbourhoods listed for Lambeth Council in London Research, sheet "Council Neighbourhoods". */
export const LAMBETH_NEIGHBOURHOODS = [
  "Brixton",
  "Clapham",
  "Streatham",
  "Vauxhall",
  "Kennington",
  "Waterloo & South Bank",
  "Herne Hill",
  "Tulse Hill",
  "West Norwood",
  "Stockwell",
  "Oval",
  "Gipsy Hill",
  "Norbury",
] as const;

export type LambethNeighbourhood = (typeof LAMBETH_NEIGHBOURHOODS)[number];

export type AreaId = "clapham" | "brixton" | "vauxhall" | "herne-hill";

export type Boundary = {
  prefix: string;
  discovery: AreaId;
  discoveryName: string;
  primaryBorough: string;
  note?: string;
};

/** Stage 0 boundary file. Prefix only. A full address still needs a person. */
export const BOUNDARIES: Boundary[] = [
  { prefix: "SW4", discovery: "clapham", discoveryName: "Clapham", primaryBorough: "Lambeth" },
  { prefix: "SW2", discovery: "brixton", discoveryName: "Brixton", primaryBorough: "Lambeth" },
  { prefix: "SW22", discovery: "brixton", discoveryName: "Tulse Hill", primaryBorough: "Lambeth" },
  { prefix: "SW9", discovery: "brixton", discoveryName: "Brixton", primaryBorough: "Lambeth" },
  { prefix: "SW98DR", discovery: "brixton", discoveryName: "Stockwell", primaryBorough: "Lambeth" },
  { prefix: "SW8", discovery: "vauxhall", discoveryName: "Vauxhall", primaryBorough: "Lambeth" },
  { prefix: "SW81PX", discovery: "vauxhall", discoveryName: "Stockwell", primaryBorough: "Lambeth" },
  { prefix: "SW81UZ", discovery: "vauxhall", discoveryName: "Stockwell", primaryBorough: "Lambeth" },
  { prefix: "SE24", discovery: "herne-hill", discoveryName: "Herne Hill", primaryBorough: "Lambeth", note: "Part of Herne Hill sits in Southwark. Confirm the address before treating the borough as settled." },
  { prefix: "SE249AY", discovery: "herne-hill", discoveryName: "Tulse Hill", primaryBorough: "Lambeth" },
  { prefix: "SE27", discovery: "herne-hill", discoveryName: "West Norwood", primaryBorough: "Lambeth" },
  { prefix: "SE279BQ", discovery: "herne-hill", discoveryName: "Tulse Hill", primaryBorough: "Lambeth" },
  { prefix: "SE19", discovery: "herne-hill", discoveryName: "Gipsy Hill", primaryBorough: "Lambeth" },
  { prefix: "SW16", discovery: "brixton", discoveryName: "Streatham", primaryBorough: "Lambeth" },
  { prefix: "SW164", discovery: "brixton", discoveryName: "Norbury", primaryBorough: "Lambeth", note: "Norbury sits on the Croydon border." },
  { prefix: "SE11", discovery: "vauxhall", discoveryName: "Kennington", primaryBorough: "Lambeth" },
  { prefix: "SE115", discovery: "vauxhall", discoveryName: "Oval", primaryBorough: "Lambeth" },
  { prefix: "SE1", discovery: "vauxhall", discoveryName: "Waterloo & South Bank", primaryBorough: "Lambeth", note: "SE1 is shared with Southwark. These listings are on the Lambeth side." },
  {
    prefix: "SW11",
    discovery: "clapham",
    discoveryName: "Clapham",
    primaryBorough: "Confirm from the address",
    note: "Some Clapham addresses sit in Wandsworth. Record the borough. Do not wait for a Wandsworth moderator.",
  },
];

const CENTROIDS: Record<LambethNeighbourhood, { lat: number; lng: number }> = {
  Brixton: { lat: 51.4613, lng: -0.1145 },
  Clapham: { lat: 51.4619, lng: -0.1382 },
  Streatham: { lat: 51.431, lng: -0.131 },
  Vauxhall: { lat: 51.4861, lng: -0.123 },
  Kennington: { lat: 51.488, lng: -0.1055 },
  "Waterloo & South Bank": { lat: 51.504, lng: -0.113 },
  "Herne Hill": { lat: 51.453, lng: -0.102 },
  "Tulse Hill": { lat: 51.44, lng: -0.105 },
  "West Norwood": { lat: 51.433, lng: -0.104 },
  Stockwell: { lat: 51.472, lng: -0.123 },
  Oval: { lat: 51.482, lng: -0.112 },
  "Gipsy Hill": { lat: 51.424, lng: -0.085 },
  Norbury: { lat: 51.411, lng: -0.12 },
};

function distanceKm(fromLat: number, fromLng: number, toLat: number, toLng: number) {
  const earth = 6371;
  const dLat = ((toLat - fromLat) * Math.PI) / 180;
  const dLng = ((toLng - fromLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((fromLat * Math.PI) / 180) * Math.cos((toLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * earth * Math.asin(Math.sqrt(a));
}

/** Nearest Lambeth neighbourhood, or null when the point is not in the borough. */
export function nearestLambethNeighbourhood(lat: number, lng: number) {
  let best: LambethNeighbourhood | null = null;
  let bestKm = 8;
  for (const name of LAMBETH_NEIGHBOURHOODS) {
    const point = CENTROIDS[name];
    const km = distanceKm(lat, lng, point.lat, point.lng);
    if (km <= bestKm) {
      best = name;
      bestKm = km;
    }
  }
  return best;
}

export function neighbourhoodsFrom(here: LambethNeighbourhood | null) {
  if (!here) return [...LAMBETH_NEIGHBOURHOODS];
  return [here, ...LAMBETH_NEIGHBOURHOODS.filter((name) => name !== here)];
}

/** Longer prefixes are matched first, so SW16 4 can be Norbury while SW16 stays Streatham. */
export function lookupPostcode(postcode: string): Boundary | null {
  const compact = postcode.toUpperCase().replace(/\s+/g, "");
  const hits = BOUNDARIES.filter((row) => compact.startsWith(row.prefix.replace(/\s+/g, "")));
  hits.sort((a, b) => b.prefix.replace(/\s+/g, "").length - a.prefix.replace(/\s+/g, "").length);
  return hits[0] ?? null;
}

export function isLambethPostcode(value: string) {
  const compact = value.toUpperCase().replace(/\s/g, "");
  return BOUNDARIES.some((row) => row.primaryBorough === "Lambeth" && compact.startsWith(row.prefix));
}
