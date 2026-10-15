import type { LambethNeighbourhood } from "@/lib/common/boundaries";

export type CouncilService = {
  id: string;
  neighbourhood: LambethNeighbourhood;
  name: string;
  kind: "Clinic" | "Dentist" | "School" | "Hospital" | "Taxi" | "Bus" | "Train" | "Police" | "Fire";
  address: string;
  detail: string;
  href?: string;
  links?: { label: string; href: string; mode?: "bus" | "tfl" | "rail" }[];
};

const SCHOOL = "https://www.lambeth.gov.uk/schools-and-education";

/** Neighbourhood clinics and dentists quoted from Lambeth Together. Schools use the council list, not a guessed school. */
export const COUNCIL_SERVICES: CouncilService[] = [
  { id: "clapham-police", neighbourhood: "Clapham", kind: "Police", name: "Brixton Police Station", address: "367 Brixton Road, SW9 7DD", detail: "The closest open front counter for Clapham. Monday to Friday 10am to 10pm, weekends 9am to 7pm. Call 999 if someone is in danger, or 101 if it can wait.", href: "https://www.met.police.uk/" },
  { id: "clapham-fire", neighbourhood: "Clapham", kind: "Fire", name: "Clapham Fire Station", address: "29 Old Town, SW4 0JT", detail: "The closest London Fire Brigade station for Clapham. If there is a fire, smoke, or someone is trapped, call 999.", href: "https://www.london-fire.gov.uk/" },
  { id: "clapham-hospital", neighbourhood: "Clapham", kind: "Hospital", name: "King’s College Hospital", address: "Denmark Hill, SE5 9RS", detail: "The nearest large hospital we list for Clapham. Call 999 rather than making your own way if you are unsure." },
  { id: "brixton-police", neighbourhood: "Brixton", kind: "Police", name: "Brixton Police Station", address: "367 Brixton Road, SW9 7DD", detail: "The staffed front counter for Brixton and the rest of Lambeth. Monday to Friday 10am to 10pm, weekends 9am to 7pm. Call 999 or 101.", href: "https://www.met.police.uk/" },
  { id: "brixton-fire", neighbourhood: "Brixton", kind: "Fire", name: "Brixton Fire Station", address: "84 Gresham Road, SW9 7NP", detail: "The closest fire station for Brixton. Call 999 if there is a fire, smoke, or someone is trapped.", href: "https://www.london-fire.gov.uk/" },
  { id: "herne-police", neighbourhood: "Herne Hill", kind: "Police", name: "Brixton Police Station", address: "367 Brixton Road, SW9 7DD", detail: "The closest open front counter for Herne Hill. Call 999 if someone is in danger, or 101 if it can wait.", href: "https://www.met.police.uk/" },
  { id: "herne-fire", neighbourhood: "Herne Hill", kind: "Fire", name: "Brixton Fire Station", address: "84 Gresham Road, SW9 7NP", detail: "The closest fire station for Herne Hill. Call 999 in a fire.", href: "https://www.london-fire.gov.uk/" },
  { id: "streatham-police", neighbourhood: "Streatham", kind: "Police", name: "Brixton Police Station", address: "367 Brixton Road, SW9 7DD", detail: "The closest open Lambeth front counter for Streatham. Call 999 or 101.", href: "https://www.met.police.uk/" },
  { id: "streatham-fire", neighbourhood: "Streatham", kind: "Fire", name: "West Norwood Fire Station", address: "210 Knight's Hill, SE27 0QA", detail: "The closest Lambeth fire station for Streatham. Call 999 if there is a fire.", href: "https://www.london-fire.gov.uk/" },
  { id: "streatham-hospital", neighbourhood: "Streatham", kind: "Hospital", name: "King’s College Hospital", address: "Denmark Hill, SE5 9RS", detail: "The nearest large hospital we list for Streatham. Call 999 if it is an emergency." },
  { id: "vauxhall-police", neighbourhood: "Vauxhall", kind: "Police", name: "Brixton Police Station", address: "367 Brixton Road, SW9 7DD", detail: "The open front counter for Lambeth, and the one to use from Vauxhall. Call 999 or 101.", href: "https://www.met.police.uk/" },
  { id: "vauxhall-fire", neighbourhood: "Vauxhall", kind: "Fire", name: "Lambeth Fire Station", address: "8 Albert Embankment, SE1 7SD", detail: "The closest fire station for Vauxhall. Call 999 in a fire.", href: "https://www.london-fire.gov.uk/" },
  { id: "kennington-police", neighbourhood: "Kennington", kind: "Police", name: "Brixton Police Station", address: "367 Brixton Road, SW9 7DD", detail: "The closest open front counter for Kennington. Call 999 or 101.", href: "https://www.met.police.uk/" },
  { id: "kennington-fire", neighbourhood: "Kennington", kind: "Fire", name: "Lambeth Fire Station", address: "8 Albert Embankment, SE1 7SD", detail: "The closest fire station for Kennington. Call 999 in a fire.", href: "https://www.london-fire.gov.uk/" },
  { id: "stockwell-police", neighbourhood: "Stockwell", kind: "Police", name: "Brixton Police Station", address: "367 Brixton Road, SW9 7DD", detail: "The closest open front counter for Stockwell. Call 999 or 101.", href: "https://www.met.police.uk/" },
  { id: "stockwell-fire", neighbourhood: "Stockwell", kind: "Fire", name: "Brixton Fire Station", address: "84 Gresham Road, SW9 7NP", detail: "The closest fire station for Stockwell. Call 999 in a fire.", href: "https://www.london-fire.gov.uk/" },
  { id: "oval-police", neighbourhood: "Oval", kind: "Police", name: "Brixton Police Station", address: "367 Brixton Road, SW9 7DD", detail: "The closest open front counter for Oval. Call 999 or 101.", href: "https://www.met.police.uk/" },
  { id: "oval-fire", neighbourhood: "Oval", kind: "Fire", name: "Lambeth Fire Station", address: "8 Albert Embankment, SE1 7SD", detail: "The closest fire station for Oval. Call 999 in a fire.", href: "https://www.london-fire.gov.uk/" },
  { id: "waterloo-police", neighbourhood: "Waterloo & South Bank", kind: "Police", name: "Brixton Police Station", address: "367 Brixton Road, SW9 7DD", detail: "The open Lambeth front counter for Waterloo. Call 999 or 101.", href: "https://www.met.police.uk/" },
  { id: "waterloo-fire", neighbourhood: "Waterloo & South Bank", kind: "Fire", name: "Lambeth Fire Station", address: "8 Albert Embankment, SE1 7SD", detail: "The closest fire station for Waterloo and the South Bank. Call 999 in a fire.", href: "https://www.london-fire.gov.uk/" },
  { id: "tulse-police", neighbourhood: "Tulse Hill", kind: "Police", name: "Brixton Police Station", address: "367 Brixton Road, SW9 7DD", detail: "The closest open front counter for Tulse Hill. Call 999 or 101.", href: "https://www.met.police.uk/" },
  { id: "tulse-fire", neighbourhood: "Tulse Hill", kind: "Fire", name: "West Norwood Fire Station", address: "210 Knight's Hill, SE27 0QA", detail: "The closest fire station for Tulse Hill. Call 999 in a fire.", href: "https://www.london-fire.gov.uk/" },
  { id: "tulse-hospital", neighbourhood: "Tulse Hill", kind: "Hospital", name: "King’s College Hospital", address: "Denmark Hill, SE5 9RS", detail: "The nearest large hospital we list for Tulse Hill. Call 999 if it is an emergency." },
  { id: "west-police", neighbourhood: "West Norwood", kind: "Police", name: "Brixton Police Station", address: "367 Brixton Road, SW9 7DD", detail: "The closest open Lambeth front counter for West Norwood. Call 999 or 101.", href: "https://www.met.police.uk/" },
  { id: "west-fire", neighbourhood: "West Norwood", kind: "Fire", name: "West Norwood Fire Station", address: "210 Knight's Hill, SE27 0QA", detail: "The fire station for West Norwood. Call 999 in a fire.", href: "https://www.london-fire.gov.uk/" },
  { id: "west-hospital", neighbourhood: "West Norwood", kind: "Hospital", name: "King’s College Hospital", address: "Denmark Hill, SE5 9RS", detail: "The nearest large hospital we list for West Norwood. Call 999 if it is an emergency." },
  { id: "gipsy-police", neighbourhood: "Gipsy Hill", kind: "Police", name: "Brixton Police Station", address: "367 Brixton Road, SW9 7DD", detail: "The closest open Lambeth front counter for Gipsy Hill. Call 999 or 101.", href: "https://www.met.police.uk/" },
  { id: "gipsy-fire", neighbourhood: "Gipsy Hill", kind: "Fire", name: "West Norwood Fire Station", address: "210 Knight's Hill, SE27 0QA", detail: "The closest fire station for Gipsy Hill. Call 999 in a fire.", href: "https://www.london-fire.gov.uk/" },
  { id: "gipsy-hospital", neighbourhood: "Gipsy Hill", kind: "Hospital", name: "King’s College Hospital", address: "Denmark Hill, SE5 9RS", detail: "The nearest large hospital we list for Gipsy Hill. Call 999 if it is an emergency." },
  { id: "norbury-police", neighbourhood: "Streatham", kind: "Police", name: "Brixton Police Station", address: "367 Brixton Road, SW9 7DD", detail: "The closest open Lambeth front counter for Norbury. Call 999 or 101.", href: "https://www.met.police.uk/" },
  { id: "norbury-fire", neighbourhood: "Streatham", kind: "Fire", name: "Norbury Fire Station", address: "1321 London Road, SW16 4AU", detail: "The closest fire station for Norbury. It sits on the Croydon side of the road. Call 999 in a fire.", href: "https://www.london-fire.gov.uk/" },
  { id: "norbury-hospital", neighbourhood: "Streatham", kind: "Hospital", name: "King’s College Hospital", address: "Denmark Hill, SE5 9RS", detail: "The nearest large hospital we list for Norbury. Call 999 if it is an emergency." },
  { id: "clapham-gp", neighbourhood: "Clapham", kind: "Clinic", name: "Clapham Family Practice", address: "89 Clapham High Street, SW4 7DB", detail: "A local GP surgery. Ring them for an appointment. If it cannot wait, use 111." },
  { id: "clapham-dentist", neighbourhood: "Clapham", kind: "Dentist", name: "Clapham South Dental Centre", address: "15 Balham Hill, SW12 9DY", detail: "A dentist listed for Clapham. Ask them if they are taking NHS patients before you travel." },
  { id: "clapham-school", neighbourhood: "Clapham", kind: "School", name: "Lambeth schools", address: "Council list for Clapham", detail: "Term dates, admissions and the school list sit with Lambeth. We do not pick a school for you.", href: SCHOOL },
  { id: "brixton-gp", neighbourhood: "Brixton", kind: "Clinic", name: "Akerman Medical Practice", address: "Akerman Health Centre, Patmos Road, SW9 6SF", detail: "A Brixton GP practice. For a same-day worry that is not 999, start with 111." },
  { id: "brixton-dentist", neighbourhood: "Brixton", kind: "Dentist", name: "Dentistry for You", address: "35 Gresham Road, SW9 7NU", detail: "A dentist listed for Brixton. Check they can see you before you set out." },
  { id: "brixton-school", neighbourhood: "Brixton", kind: "School", name: "Lambeth schools", address: "Council list for Brixton", detail: "The council holds the school list. This page only points you there.", href: SCHOOL },
  { id: "brixton-hospital", neighbourhood: "Brixton", kind: "Hospital", name: "King’s College Hospital", address: "Denmark Hill, SE5 9RS", detail: "The hospital for this side of the borough. If it is an emergency, call 999 rather than making your own way if you are unsure." },
  { id: "herne-gp", neighbourhood: "Herne Hill", kind: "Clinic", name: "Herne Hill Group Practice", address: "74 Herne Hill, SE24 9QP", detail: "The local GP practice. They are not an emergency department." },
  { id: "herne-dentist", neighbourhood: "Herne Hill", kind: "Dentist", name: "Denmark Hill Dental Surgery", address: "170 Denmark Hill, SE5 8EE", detail: "A dentist listed for the Brixton and Herne Hill area." },
  { id: "herne-school", neighbourhood: "Herne Hill", kind: "School", name: "Lambeth schools", address: "Council list for Herne Hill", detail: "Admissions and the school list are on the council site.", href: SCHOOL },
  { id: "herne-hospital", neighbourhood: "Herne Hill", kind: "Hospital", name: "King’s College Hospital", address: "Denmark Hill, SE5 9RS", detail: "The nearest large hospital on the Lambeth Together list for this area." },
  { id: "streatham-gp", neighbourhood: "Streatham", kind: "Clinic", name: "Edith Cavell Surgery", address: "41 A–C Streatham Hill, SW2 4TP", detail: "A Streatham GP. For urgent care that is not life-threatening, call 111." },
  { id: "streatham-dentist", neighbourhood: "Streatham", kind: "Dentist", name: "Streatham Dental Centre", address: "393 Streatham High Road, SW16 3PE", detail: "A dentist listed for Streatham." },
  { id: "streatham-school", neighbourhood: "Streatham", kind: "School", name: "Lambeth schools", address: "Council list for Streatham", detail: "The council list is the place to start for a school place.", href: SCHOOL },
  { id: "vauxhall-gp", neighbourhood: "Vauxhall", kind: "Clinic", name: "Lambeth Walk Group Practice", address: "5 Lambeth Walk, SE11 6SP", detail: "A GP listed for North Lambeth. Vauxhall uses this patch." },
  { id: "vauxhall-dentist", neighbourhood: "Vauxhall", kind: "Dentist", name: "Kennington Dental Surgery", address: "330 Kennington Park Road, SE11 4PP", detail: "A dentist listed for North Lambeth and Stockwell." },
  { id: "vauxhall-school", neighbourhood: "Vauxhall", kind: "School", name: "Lambeth schools", address: "Council list for Vauxhall", detail: "School places are handled by the council, not by this app.", href: SCHOOL },
  { id: "vauxhall-hospital", neighbourhood: "Vauxhall", kind: "Hospital", name: "St Thomas’ Hospital", address: "Westminster Bridge Road, SE1 7EH", detail: "The hospital listed for North Lambeth. In an emergency, call 999." },
  { id: "kennington-gp", neighbourhood: "Kennington", kind: "Clinic", name: "Lambeth Walk Group Practice", address: "5 Lambeth Walk, SE11 6SP", detail: "A GP on the North Lambeth list, close to Kennington." },
  { id: "kennington-dentist", neighbourhood: "Kennington", kind: "Dentist", name: "Kennington Dental Surgery", address: "330 Kennington Park Road, SE11 4PP", detail: "A dentist on Kennington Park Road." },
  { id: "kennington-school", neighbourhood: "Kennington", kind: "School", name: "Lambeth schools", address: "Council list for Kennington", detail: "See the council list for schools in this part of the borough.", href: SCHOOL },
  { id: "kennington-hospital", neighbourhood: "Kennington", kind: "Hospital", name: "St Thomas’ Hospital", address: "Westminster Bridge Road, SE1 7EH", detail: "The North Lambeth hospital. Call 999 if someone needs an ambulance." },
  { id: "stockwell-gp", neighbourhood: "Stockwell", kind: "Clinic", name: "Lambeth Walk Group Practice", address: "5 Lambeth Walk, SE11 6SP", detail: "Listed for the North Lambeth and Stockwell patch." },
  { id: "stockwell-dentist", neighbourhood: "Stockwell", kind: "Dentist", name: "Blue Dental Care", address: "232 Stockwell Road, SW9 9SU", detail: "A dentist on the Brixton and Stockwell lists." },
  { id: "stockwell-school", neighbourhood: "Stockwell", kind: "School", name: "Lambeth schools", address: "Council list for Stockwell", detail: "The council page is the list of schools. We do not rank them.", href: SCHOOL },
  { id: "stockwell-hospital", neighbourhood: "Stockwell", kind: "Hospital", name: "St Thomas’ Hospital", address: "Westminster Bridge Road, SE1 7EH", detail: "The hospital named for North Lambeth and Stockwell." },
  { id: "oval-gp", neighbourhood: "Oval", kind: "Clinic", name: "Vassall Medical Centre", address: "89 Vassall Road, SW9 6NA", detail: "A GP practice a short walk from the Oval." },
  { id: "oval-dentist", neighbourhood: "Oval", kind: "Dentist", name: "Kennington Dental Surgery", address: "330 Kennington Park Road, SE11 4PP", detail: "The nearest dentist on the North Lambeth list." },
  { id: "oval-school", neighbourhood: "Oval", kind: "School", name: "Lambeth schools", address: "Council list for Oval", detail: "School admissions stay with Lambeth Council.", href: SCHOOL },
  { id: "oval-hospital", neighbourhood: "Oval", kind: "Hospital", name: "St Thomas’ Hospital", address: "Westminster Bridge Road, SE1 7EH", detail: "The large hospital for the north of the borough." },
  { id: "waterloo-hospital", neighbourhood: "Waterloo & South Bank", kind: "Hospital", name: "St Thomas’ Hospital", address: "Westminster Bridge Road, SE1 7EH", detail: "On the doorstep of Waterloo. Still call 999 if it is an emergency." },
  { id: "waterloo-gp", neighbourhood: "Waterloo & South Bank", kind: "Clinic", name: "Lambeth Walk Group Practice", address: "5 Lambeth Walk, SE11 6SP", detail: "A GP listed for North Lambeth, which covers this end of the borough." },
  { id: "waterloo-dentist", neighbourhood: "Waterloo & South Bank", kind: "Dentist", name: "Kennington Dental Surgery", address: "330 Kennington Park Road, SE11 4PP", detail: "A dentist on the North Lambeth list." },
  { id: "waterloo-school", neighbourhood: "Waterloo & South Bank", kind: "School", name: "Lambeth schools", address: "Council list for Waterloo", detail: "The council list covers school places here.", href: SCHOOL },
  { id: "tulse-gp", neighbourhood: "Tulse Hill", kind: "Clinic", name: "Brockwell Park Surgery", address: "117 Norwood Road, SE24 9AE", detail: "A GP on the Norwood list, used by Tulse Hill." },
  { id: "tulse-dentist", neighbourhood: "Tulse Hill", kind: "Dentist", name: "Rosendental", address: "107A Rosendale Road, SE21 8EZ", detail: "A dentist listed for Norwood." },
  { id: "tulse-school", neighbourhood: "Tulse Hill", kind: "School", name: "Lambeth schools", address: "Council list for Tulse Hill", detail: "Start with the council’s school list.", href: SCHOOL },
  { id: "west-gp", neighbourhood: "West Norwood", kind: "Clinic", name: "Brockwell Park Surgery", address: "117 Norwood Road, SE24 9AE", detail: "A Norwood GP. West Norwood is in this patch." },
  { id: "west-dentist", neighbourhood: "West Norwood", kind: "Dentist", name: "Norwood Dental Clinic", address: "222 Norwood Road, SE27 9AQ", detail: "A dentist listed for Norwood." },
  { id: "west-school", neighbourhood: "West Norwood", kind: "School", name: "Lambeth schools", address: "Council list for West Norwood", detail: "The council page lists the schools. We do not.", href: SCHOOL },
  { id: "gipsy-gp", neighbourhood: "Gipsy Hill", kind: "Clinic", name: "Brockwell Park Surgery", address: "117 Norwood Road, SE24 9AE", detail: "The Norwood GP list is the one that covers the hill." },
  { id: "gipsy-dentist", neighbourhood: "Gipsy Hill", kind: "Dentist", name: "Rosendental", address: "107A Rosendale Road, SE21 8EZ", detail: "A dentist on the Norwood list." },
  { id: "gipsy-school", neighbourhood: "Gipsy Hill", kind: "School", name: "Lambeth schools", address: "Council list for Gipsy Hill", detail: "Some families also look at Croydon schools. Lambeth’s list is the one we link.", href: SCHOOL },
  { id: "norbury-gp", neighbourhood: "Streatham", kind: "Clinic", name: "Streatham High Practice", address: "2–8 Gracefield Gardens, SW16 2ST", detail: "A Streatham GP, the nearest listed practice for Norbury on the Lambeth side." },
  { id: "norbury-dentist", neighbourhood: "Streatham", kind: "Dentist", name: "Streatham Dental Centre", address: "393 Streatham High Road, SW16 3PE", detail: "A dentist on the Streatham list, towards Norbury." },
  { id: "norbury-school", neighbourhood: "Streatham", kind: "School", name: "Lambeth schools", address: "Council list for Norbury", detail: "Norbury sits on the Croydon border. This link is Lambeth’s school list.", href: SCHOOL },
];

const rail = (crs: string) => `https://www.nationalrail.co.uk/live-trains/departures/${crs}/`;
const tube = (name: string) => `https://tfl.gov.uk/plan-a-journey/results?InputFrom=${encodeURIComponent(name)}`;
const bus = (name: string) => `https://tfl.gov.uk/bus/stop/?query=${encodeURIComponent(name)}`;

const TRAVEL: {
  neighbourhood: LambethNeighbourhood;
  taxi: string;
  buses: string[];
  trains: { label: string; href: string }[];
}[] = [
  {
    neighbourhood: "Clapham",
    taxi: "Clapham Common Station, The Pavement, SW4 0DT",
    buses: ["Clapham Common Station", "Clapham North Station", "Clapham South Station", "Clapham High Street"],
    trains: [
      { label: "Clapham High Street", href: rail("CLP") },
      { label: "Clapham Common", href: tube("Clapham Common Underground Station") },
      { label: "Clapham North", href: tube("Clapham North Underground Station") },
      { label: "Clapham South", href: tube("Clapham South Underground Station") },
    ],
  },
  {
    neighbourhood: "Brixton",
    taxi: "Brixton Station, Brixton Road, SW9 8HE",
    buses: ["Brixton Station", "Brixton Road / Coldharbour Lane", "Brixton Hill / Morval Road"],
    trains: [
      { label: "Brixton", href: tube("Brixton Underground Station") },
      { label: "Loughborough Junction", href: rail("LGJ") },
    ],
  },
  {
    neighbourhood: "Herne Hill",
    taxi: "Herne Hill Station, Railton Road, SE24 0JW",
    buses: ["Herne Hill Station", "Herne Hill / Half Moon Lane"],
    trains: [{ label: "Herne Hill", href: rail("HNH") }],
  },
  {
    neighbourhood: "Streatham",
    taxi: "Streatham Station, Streatham High Road, SW16 6HP",
    buses: ["Streatham Station", "Streatham Hill Station", "Streatham Common Station"],
    trains: [
      { label: "Streatham", href: rail("STE") },
      { label: "Streatham Hill", href: rail("SRH") },
      { label: "Streatham Common", href: rail("SRC") },
    ],
  },
  {
    neighbourhood: "Vauxhall",
    taxi: "Vauxhall Station, Bondway, SW8 1SJ",
    buses: ["Vauxhall Bus Station", "Vauxhall Station"],
    trains: [{ label: "Vauxhall", href: rail("VXH") }],
  },
  {
    neighbourhood: "Kennington",
    taxi: "Kennington Station, Kennington Park Road, SE11 4HG",
    buses: ["Kennington Station", "Kennington Park"],
    trains: [{ label: "Kennington", href: tube("Kennington Underground Station") }],
  },
  {
    neighbourhood: "Stockwell",
    taxi: "Stockwell Station, Clapham Road, SW9 9AE",
    buses: ["Stockwell Station", "Clapham Road / Stockwell"],
    trains: [{ label: "Stockwell", href: tube("Stockwell Underground Station") }],
  },
  {
    neighbourhood: "Oval",
    taxi: "Oval Station, Clapham Road, SW8 1XN",
    buses: ["Oval Station", "Clapham Road / Harleyford Street"],
    trains: [{ label: "Oval", href: tube("Oval Underground Station") }],
  },
  {
    neighbourhood: "Waterloo & South Bank",
    taxi: "Waterloo Station, Cab Road, SE1 8SW",
    buses: ["Waterloo Station", "York Road / Waterloo"],
    trains: [
      { label: "London Waterloo", href: rail("WAT") },
      { label: "Waterloo East", href: rail("WAE") },
    ],
  },
  {
    neighbourhood: "Tulse Hill",
    taxi: "Tulse Hill Station, Norwood Road, SE24 9BJ",
    buses: ["Tulse Hill Station", "Norwood Road / Tulse Hill"],
    trains: [{ label: "Tulse Hill", href: rail("TUH") }],
  },
  {
    neighbourhood: "West Norwood",
    taxi: "West Norwood Station, Knights Hill, SE27 0HS",
    buses: ["West Norwood Station", "Norwood Road / Knights Hill"],
    trains: [{ label: "West Norwood", href: rail("WNW") }],
  },
  {
    neighbourhood: "Gipsy Hill",
    taxi: "Gipsy Hill Station, Gipsy Hill, SE19 1QJ",
    buses: ["Gipsy Hill Station", "Gipsy Hill / Dulwich Wood Park"],
    trains: [{ label: "Gipsy Hill", href: rail("GIP") }],
  },
  {
    neighbourhood: "Streatham",
    taxi: "Norbury Station, London Road, SW16 4AH",
    buses: ["Norbury Station", "London Road / Norbury"],
    trains: [{ label: "Streatham", href: rail("NRB") }],
  },
];

export const TRAVEL_SERVICES: CouncilService[] = TRAVEL.flatMap((row) => {
  const slug = row.neighbourhood.toLowerCase().replace(/[^a-z]+/g, "-");
  return [
    {
      id: `${slug}-taxi`,
      neighbourhood: row.neighbourhood,
      kind: "Taxi" as const,
      name: "Request a taxi",
      address: row.taxi,
      detail: `A licensed taxi from the rank at ${row.taxi}. Nothing is booked until a cab firm confirms, and this preview does not take payment.`,
      href: "https://tfl.gov.uk/modes/taxis-and-minicabs/",
    },
    {
      id: `${slug}-bus`,
      neighbourhood: row.neighbourhood,
      kind: "Bus" as const,
      name: "Bus times",
      address: row.buses[0],
      detail: `Bus stops in ${row.neighbourhood}. The next buses are shown here.`,
      href: "https://tfl.gov.uk/modes/buses/",
      links: row.buses.map((label) => ({ label, href: bus(label), mode: "bus" as const })),
    },
    {
      id: `${slug}-train`,
      neighbourhood: row.neighbourhood,
      kind: "Train" as const,
      name: "Train times",
      address: row.trains[0].label,
      detail: `Stations used from ${row.neighbourhood}. The next trains are shown here.`,
      href: "https://www.nationalrail.co.uk/",
      links: row.trains.map((item) => ({ ...item, mode: item.href.includes("nationalrail") ? ("rail" as const) : ("tfl" as const) })),
    },
  ];
});
