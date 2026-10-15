export type GeoPermission = "granted" | "prompt" | "denied" | "unsupported";

export function watchGeoPermission(onChange: (state: GeoPermission) => void) {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    onChange("unsupported");
    return () => undefined;
  }
  if (!navigator.permissions?.query) {
    onChange("prompt");
    return () => undefined;
  }

  let detach: () => void = () => undefined;
  let cancelled = false;
  void navigator.permissions
    .query({ name: "geolocation" })
    .then((status) => {
      if (cancelled) return;
      const publish = () => onChange(status.state === "granted" || status.state === "denied" ? status.state : "prompt");
      publish();
      status.addEventListener("change", publish);
      detach = () => status.removeEventListener("change", publish);
    })
    .catch(() => {
      if (!cancelled) onChange("prompt");
    });

  return () => {
    cancelled = true;
    detach();
  };
}

export function readPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(Object.assign(new Error("unsupported"), { code: 0 }));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      maximumAge: 5 * 60 * 1000,
      timeout: 10000,
    });
  });
}

export function locationMessage(error: unknown, fallback: string) {
  const code = typeof error === "object" && error !== null && "code" in error ? Number((error as { code: number }).code) : 0;
  if (code === 1) return "Location is blocked. Allow it in the browser, or type a starting point.";
  if (code === 3) return "Location took too long. Type a starting point instead.";
  return fallback;
}
