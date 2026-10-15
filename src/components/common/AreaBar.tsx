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
const DISMISS_KEY = "common-geo-dismissed";

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
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
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
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
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
      {here.permission === "prompt" && !here.dismissed ? (
        <p className="text-[11px] text-muted">
          <button type="button" className="font-medium text-primary" onClick={() => void here.allowLocation()}>
            Use location
          </button>
          <button type="button" className="ml-2" onClick={here.dismiss}>
            Not now
          </button>
        </p>
      ) : null}
      {here.permission === "denied" ? (
        <p className="text-xs text-muted">
          Location is blocked. Pick a neighbourhood, or allow location for this site in the browser.{" "}
          <button type="button" className="font-medium text-primary" onClick={() => void here.allowLocation()}>
            Try again
          </button>
        </p>
      ) : null}
      {here.permission === "unsupported" ? <p className="text-xs text-muted">This browser has no location. Pick a neighbourhood.</p> : null}
      {here.note ? <p className="text-xs text-muted">{here.note}</p> : null}
      <div className="flex min-w-0 max-w-full gap-1.5 overflow-x-auto">
        {here.areas.map((name) => (
          <Chip key={name} active={here.neighbourhood === name} onClick={() => here.pick(name)}>
            {name}
          </Chip>
        ))}
      </div>
    </>
  );
}
