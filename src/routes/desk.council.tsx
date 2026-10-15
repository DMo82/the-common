import { createFileRoute } from "@tanstack/react-router";
import { DoorCheck } from "@/components/common/DoorCheck";
import { DeskDenied, DeskLocked, deskAllows, useDeskSeat } from "@/components/desk/DeskFrame";
import { LAMBETH_NEIGHBOURHOODS } from "@/lib/common/boundaries";
import { areaFor } from "@/lib/common/model";
import { COUNCIL_SERVICES } from "@/lib/common/services";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/desk/council")({ component: CouncilDesk });

function CouncilDesk() {
  const { seat, ready } = useDeskSeat();
  const account = useCommon((state) => state.account);
  const directory = useCommon((state) => state.directory ?? []);
  const businesses = useCommon((state) => state.businesses);
  const events = useCommon((state) => state.events);
  const listings = useCommon((state) => state.listings);
  const news = useCommon((state) => state.news);
  const reservations = useCommon((state) => state.reservations);
  const incidents = useCommon((state) => state.incidents);
  const notes = useCommon((state) => state.councilNotes ?? []);
  const measures = useCommon((state) => state.measures);

  if (!ready) return null;
  const councilAccount = account?.kind === "council" || account?.kind === "council_partner";
  if (!seat && !councilAccount) return <DeskLocked />;
  if (seat && !deskAllows(seat, "council") && !councilAccount) return <DeskDenied />;

  const jobs = listings.filter((row) => row.kind === "job" || row.category === "Jobs & Services");
  const councilEvents = events.filter((row) => /council/i.test(row.title + row.kind));
  const tickets = reservations.filter((row) => councilEvents.some((event) => event.id === row.eventId));
  const areaName = (postcode?: string) => (postcode ? areaFor(postcode)?.discoveryName : "") || "Unmatched";
  const sample: Record<string, { users: number; shops: number; events: number; listings: number; jobs: number }> = {
    Clapham: { users: 420, shops: 18, events: 6, listings: 24, jobs: 4 },
    Brixton: { users: 610, shops: 22, events: 8, listings: 31, jobs: 6 },
    Streatham: { users: 380, shops: 14, events: 4, listings: 16, jobs: 3 },
    "Herne Hill": { users: 210, shops: 9, events: 3, listings: 11, jobs: 2 },
    Stockwell: { users: 260, shops: 11, events: 3, listings: 12, jobs: 2 },
    Vauxhall: { users: 190, shops: 8, events: 2, listings: 9, jobs: 2 },
    "West Norwood": { users: 240, shops: 10, events: 3, listings: 10, jobs: 2 },
    Kennington: { users: 170, shops: 7, events: 2, listings: 8, jobs: 1 },
  };
  const sampleUsers = Object.values(sample).reduce((sum, row) => sum + row.users, 0);

  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.14em] text-primary">LAMBETH</p>
        <h1 className="mt-1 font-serif text-3xl text-deep">Council briefing</h1>
        <p className="mt-1 text-sm text-muted">Live figures from the same counts as the admin desk.</p>
      </div>
      <Box title="The borough">
        <Stat label="Users" value={directory.length} />
        <Stat label="Businesses" value={businesses.filter((row) => row.status === "published").length} />
        <Stat label="Events" value={events.filter((row) => row.status === "published").length} />
        <Stat label="Marketplace listings" value={listings.filter((row) => row.status === "published").length} />
        <Stat label="Employment listings" value={jobs.filter((row) => row.status === "published").length} />
      </Box>
      <Box title="News and council events">
        <Stat label="News views recorded" value={measures?.views ?? 0} />
        <Stat label="Council events" value={councilEvents.length} />
        <Stat label="Tickets sold" value={tickets.length} />
      </Box>
      <Box title="Council services and civic tools">
        <div className="col-span-2 grid gap-2">
          {["Transport", "Service requests", "Council directory and knowledge base", "Public consultations and surveys", "Incidents and service notes"].map((label) => (
            <div key={label} aria-disabled="true" className="flex items-center justify-between rounded-xl border border-line bg-band px-3 py-2 text-sm text-muted">
              <span>{label}</span>
              <span className="text-xs">Coming later</span>
            </div>
          ))}
        </div>
      </Box>
      <Box title="Incidents and services">
        <Stat label="Police reports" value={incidents.filter((row) => row.service === "police").length} />
        <Stat label="Fire reports" value={incidents.filter((row) => row.service === "fire").length} />
        <Stat label="Hospital reports" value={0} />
        <Stat label="Services requested" value={measures?.bookings ?? 0} />
      </Box>
      <Box title="From the public">
        <Stat label="Complaints" value={notes.filter((row) => row.kind === "complaint").length} />
        <Stat label="Suggestions" value={notes.filter((row) => row.kind === "suggestion").length} />
        <Stat label="Concerns" value={notes.filter((row) => row.kind === "concern").length} />
        <div className="col-span-2 grid gap-2">
          {notes.length === 0 ? <p className="text-sm text-muted">No notes yet.</p> : notes.map((row) => <p key={row.id} className="rounded-xl bg-band px-3 py-2 text-sm"><span className="capitalize text-muted">{row.kind} · {row.neighbourhood}. </span>{row.body}</p>)}
        </div>
      </Box>
      <Box title="By neighbourhood">
        <div className="col-span-2 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted"><tr><th className="py-1">Area</th><th>Users</th><th>Shops</th><th>Events</th><th>Listings</th><th>Jobs</th></tr></thead>
            <tbody>
              {LAMBETH_NEIGHBOURHOODS.map((name) => (
                <tr key={name} className="border-t border-line">
                  <td className="py-2">{name}</td>
                  <td>{directory.filter((row) => row.neighbourhood === name).length}</td>
                  <td>{businesses.filter((row) => row.status === "published" && areaFor(row.postcode)?.discoveryName === name).length}</td>
                  <td>{events.filter((row) => row.status === "published" && row.neighbourhood === name).length}</td>
                  <td>{listings.filter((row) => areaName(businesses.find((item) => item.id === row.businessId)?.postcode) === name).length}</td>
                  <td>{jobs.filter((row) => areaName(businesses.find((item) => item.id === row.businessId)?.postcode) === name).length}</td>
                </tr>
              ))}
              <tr className="border-t border-line">
                <td className="py-2">Unassigned</td>
                <td>{directory.filter((row) => !LAMBETH_NEIGHBOURHOODS.includes(row.neighbourhood as typeof LAMBETH_NEIGHBOURHOODS[number])).length}</td>
                <td>{businesses.filter((row) => row.status === "published" && !areaFor(row.postcode)).length}</td>
                <td>{events.filter((row) => row.status === "published" && !row.neighbourhood).length}</td>
                <td>{listings.filter((row) => !areaName(businesses.find((item) => item.id === row.businessId)?.postcode)).length}</td>
                <td>{jobs.filter((row) => !areaName(businesses.find((item) => item.id === row.businessId)?.postcode)).length}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Box>
      <Box title="Incident notes">
        <div className="col-span-2 grid gap-2">
          {incidents.length === 0 ? <p className="text-sm text-muted">None filed here.</p> : incidents.map((row) => <p key={row.id} className="rounded-xl bg-band px-3 py-2 text-sm"><span className="text-muted">{row.service} · {row.neighbourhood}. </span>{row.description}</p>)}
        </div>
      </Box>
    </div>
  );
}

function Box({ title, open, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return <details open={open} className="rounded-3xl border border-line bg-white p-4 shadow-[0_10px_24px_-20px_rgba(16,40,32,0.7)]"><summary className="cursor-pointer font-serif text-2xl text-deep">{title}</summary><div className="mt-3 grid grid-cols-2 gap-2">{children}</div></details>;
}
function Stat({ label, value }: { label: string; value: number }) {
  return <p className="rounded-2xl bg-band px-3 py-3"><span className="block font-serif text-2xl text-deep">{value < 3 ? "–" : value}</span><span className="text-xs text-muted">{label}</span></p>;
}
