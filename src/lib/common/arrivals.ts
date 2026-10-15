import type { BoardRow } from "@/lib/common/departures";

type Match = { id: string; modes?: string[] };
type Prediction = {
  lineName?: string;
  destinationName?: string;
  towards?: string;
  timeToStation?: number;
  platformName?: string;
  modeName?: string;
};

function rowFrom(item: Prediction): BoardRow {
  const minutes = Math.max(0, Math.round((item.timeToStation ?? 0) / 60));
  return {
    line: item.lineName || "Service",
    destination: item.towards || item.destinationName || "See stop",
    minutes,
    note: item.platformName || "",
  };
}

export async function tflBoard(query: string, modes: string): Promise<BoardRow[]> {
  const search = await fetch(`https://api.tfl.gov.uk/StopPoint/Search?query=${encodeURIComponent(query)}&modes=${modes}`);
  if (!search.ok) return [];
  const found = (await search.json()) as { matches?: Match[] };
  const stops = (found.matches ?? []).slice(0, modes === "bus" ? 2 : 1);
  if (stops.length === 0) return [];
  const lists = await Promise.all(
    stops.map(async (stop) => {
      const response = await fetch(`https://api.tfl.gov.uk/StopPoint/${encodeURIComponent(stop.id)}/Arrivals`);
      if (!response.ok) return [] as Prediction[];
      return (await response.json()) as Prediction[];
    }),
  );
  return lists
    .flat()
    .filter((item) => (item.timeToStation ?? 0) >= 0)
    .sort((a, b) => (a.timeToStation ?? 0) - (b.timeToStation ?? 0))
    .slice(0, 6)
    .map(rowFrom);
}
