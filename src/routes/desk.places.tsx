import { createFileRoute } from "@tanstack/react-router";
import { DeskFrame } from "@/components/desk/DeskFrame";

export const Route = createFileRoute("/desk/places")({ component: PlacesDesk });

function PlacesDesk() {
  return (
    <DeskFrame>
      <div className="grid gap-4">
        <h1 className="text-2xl font-bold text-[#102820]">Places</h1>
        <p className="text-sm text-[#5C6F64]">Businesses, events, and marketplace listings.</p>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
            <h2 className="font-medium text-[#102820]">Businesses</h2>
            <p className="mt-1 text-2xl font-bold text-[#102820]">24</p>
            <p className="text-xs text-[#5C6F64]">12 pending</p>
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
            <h2 className="font-medium text-[#102820]">Events</h2>
            <p className="mt-1 text-2xl font-bold text-[#102820]">8</p>
            <p className="text-xs text-[#5C6F64]">3 pending</p>
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
            <h2 className="font-medium text-[#102820]">Listings</h2>
            <p className="mt-1 text-2xl font-bold text-[#102820]">15</p>
            <p className="text-xs text-[#5C6F64]">5 pending</p>
          </div>
        </div>
      </div>
    </DeskFrame>
  );
}
