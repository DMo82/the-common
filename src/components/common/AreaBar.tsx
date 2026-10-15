import { useEffect, useRef, useState } from "react";
import { Chip } from "@/components/common/Shell";
import {
  LAMBETH_NEIGHBOURHOODS,
  nearestLambethNeighbourhood,
  neighbourhoodsFrom,
  type LambethNeighbourhood,
} from "@/lib/common/boundaries";
import { locationMessage, readPosition, watchGeoPermission, type GeoPermission } from "@/lib/common/location";

const AREA_KEY = "common-neighbourhood";
const PICKED_KEY = "common-neighbourhood-picked";
const DISMISS_KEY = "loc_prompt_dismissed_at";

function readStoredArea() {
  if (typeof sessionStorage === "undefined") return null;
  const value = sessionStorage.getItem(AREA_KEY);
  return LAMBETH_NEIGHBOURHOODS.find((name) => name === value) ?? null;
}

export function useHere() {
  const [neighbourhood, setNeighbourhood] = useState<LambethNeighbourhood>("Clapham");
  const [areas, setAreas] = useState<LambethNeighbourhood[]>(neighbourhoodsFrom("Clapham"));
  const [permission, setPermission] = useState<GeoPermission>("prompt");
  const [dismissed, setDismissed] = useState(false);
  const [note, setNote] = useState("");
  const userPicked = useRef(false);

  useEffect(() => {
    const stored = readStoredArea();
    userPicked.current = sessionStorage.getItem(PICKED_KEY) === "1";
    if (stored) {
      setAreas(neighbourhoodsFrom(stored));
      setNeighbourhood(stored);
    }
    const dismissedAt = sessionStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const days = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      setDismissed(days < 30);
    }
    return watchGeoPermission(setPermission);
  }, []);

  function apply(here: LambethNeighbourhood) {
    setNote("");
    setAreas(neighbourhoodsFrom(here));
    sessionStorage.setItem(AREA_KEY, here);
    if (!userPicked.current) setNeighbourhood(here);
  }

  useEffect(() => {
    if (permission !== "granted") return;
    let cancel = false;
    void readPosition()
      .then((position) => {
        if (cancel) return;
        const here = nearestLambethNeighbourhood(position.coords.latitude, position.coords.longitude);
        if (!here) {
          setNote("You're outside these neighbourhoods. Pick one.");
          return;
        }
        apply(here);
      })
      .catch((error: unknown) => {
        if (!cancel) setNote(locationMessage(error, "Location didn't come through. Pick a neighbourhood."));
      });
    return () => {
      cancel = true;
    };
  }, [permission]);

  async function allowLocation() {
    setNote("");
    try {
      const position = await readPosition();
      setPermission("granted");
      const here = nearestLambethNeighbourhood(position.coords.latitude, position.coords.longitude);
      if (!here) {
        setNote("You're outside these neighbourhoods. Pick one.");
        return;
      }
      apply(here);
    } catch (error) {
      setNote(locationMessage(error, "Location didn't come through. Pick a neighbourhood."));
      if (typeof error === "object" && error !== null && "code" in error && (error as { code: number }).code === 1) {
        setPermission("denied");
      }
    }
  }

  function pick(name: LambethNeighbourhood) {
    userPicked.current = true;
    sessionStorage.setItem(PICKED_KEY, "1");
    sessionStorage.setItem(AREA_KEY, name);
    setNeighbourhood(name);
    setAreas(neighbourhoodsFrom(name));
  }

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
    setNote("OK. You can turn on location in Settings.");
  }

  return { neighbourhood, areas, permission, dismissed, note, allowLocation, pick, dismiss };
}

export function AreaBar({
  here,
}: {
  here: ReturnType<typeof useHere>;
}) {
  return (
    <>
      {here.permission === "denied" ? (
        <p className="text-sm text-muted">Location is off. We'll use your postcode instead.</p>
      ) : null}
      {here.permission === "unsupported" ? <p className="text-xs text-muted">This browser has no location. Pick a neighbourhood.</p> : null}
      {here.note ? <p className="text-xs text-muted">{here.note}</p> : null}
      <div className="flex min-w-0 max-w-full gap-1.5 overflow-x-auto">
        {here.permission === "prompt" && !here.dismissed ? (
          <button type="button" aria-label="Use my location" onClick={() => void here.allowLocation()} className="flex h-8 shrink-0 items-center gap-1 rounded-full border border-[#306830] px-3 text-sm font-medium text-[#306830]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
            Use my location
          </button>
        ) : null}
        {here.areas.map((name) => (
          <Chip key={name} active={here.neighbourhood === name} onClick={() => here.pick(name)}>
            {name}
          </Chip>
        ))}
      </div>
    </>
  );
}
