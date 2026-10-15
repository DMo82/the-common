import { createServerFn } from "@tanstack/react-start";

export type BoardRow = {
  line: string;
  destination: string;
  minutes: number;
  note: string;
};

type RailService = {
  isCancelled?: boolean | null;
  destination?: { locationName?: string }[];
  departureInfo?: { scheduled?: string; estimated?: string };
  platform?: string | null;
  operator?: { name?: string };
  status?: { status?: string };
};

export const railBoard = createServerFn({ method: "GET" })
  .validator((name: string) => name.trim().slice(0, 80))
  .handler(async ({ data }): Promise<BoardRow[]> => {
    const slug = data.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!slug) return [];
    const response = await fetch(`https://www.nationalrail.co.uk/live-trains/departures/${slug}/`, {
      headers: { "user-agent": "TheCommonCommunity/1.0" },
      redirect: "follow",
    });
    if (!response.ok) return [];
    const html = await response.text();
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (!match) return [];
    const parsed = JSON.parse(match[1]) as { props?: { pageProps?: { fetchResults?: { services?: RailService[] } } } };
    const services = parsed.props?.pageProps?.fetchResults?.services ?? [];
    const now = Date.now();
    return services.slice(0, 6).map((service) => {
      const when = service.departureInfo?.estimated || service.departureInfo?.scheduled;
      const at = when ? new Date(when).getTime() : now;
      const minutes = Math.max(0, Math.round((at - now) / 60000));
      const destination = service.destination?.[0]?.locationName || "See station";
      const status = service.isCancelled ? "Cancelled" : service.status?.status || "";
      const platform = service.platform ? `Plat ${service.platform}` : "";
      return {
        line: service.operator?.name || "Train",
        destination,
        minutes,
        note: [status, platform].filter(Boolean).join(" · "),
      };
    });
  });

export const taxiEstimate = createServerFn({ method: "GET" })
  .validator((input: { from: string; to: string }) => ({
    from: input.from.trim().slice(0, 120),
    to: input.to.trim().slice(0, 120),
  }))
  .handler(async ({ data }): Promise<{ minutes: number; miles: number } | null> => {
    async function point(query: string) {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(`${query}, London`)}`, {
        headers: { "user-agent": "TheCommonCommunity/1.0", accept: "application/json" },
      });
      if (!response.ok) return null;
      const rows = (await response.json()) as { lat?: string; lon?: string }[];
      if (!rows[0]?.lat || !rows[0]?.lon) return null;
      return { lat: rows[0].lat, lon: rows[0].lon };
    }
    const from = await point(data.from);
    const to = await point(data.to);
    if (!from || !to) return null;
    const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`);
    if (!response.ok) return null;
    const body = (await response.json()) as { routes?: { duration?: number; distance?: number }[] };
    const seconds = body.routes?.[0]?.duration;
    const metres = body.routes?.[0]?.distance;
    if (!seconds || !metres) return null;
    return { minutes: Math.max(1, Math.round(seconds / 60)), miles: Math.round((metres / 1609.34) * 10) / 10 };
  });
