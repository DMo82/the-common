import { useState } from "react";

type Place = { name: string; address: string; postcode: string };

function placeQuery(place: Place) {
  return `${place.name}, ${place.address}, ${place.postcode}, London`;
}

export function MapView({ place, origin }: { place: Place; origin?: string }) {
  const [open, setOpen] = useState(false);
  const destination = placeQuery(place);
  const src = origin?.trim()
    ? `https://maps.google.com/maps?saddr=${encodeURIComponent(origin.trim())}&daddr=${encodeURIComponent(destination)}&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(destination)}&z=16&output=embed`;

  if (!open) {
    return (
      <button type="button" className="h-24 w-full rounded-2xl border border-line bg-band text-sm font-medium" onClick={() => setOpen(true)}>
        Show map
      </button>
    );
  }

  return (
    <iframe
      title={`Google Maps, ${place.name}`}
      src={src}
      className="h-72 w-full rounded-2xl border border-line bg-band"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
