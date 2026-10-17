import { createFileRoute } from "@tanstack/react-router";
import { DeskFrame } from "@/components/desk/DeskFrame";

export const Route = createFileRoute("/desk/communication")({ component: CommunicationDesk });

function CommunicationDesk() {
  return (
    <DeskFrame>
      <div className="grid gap-4">
        <h1 className="text-2xl font-bold text-[#102820]">Communication</h1>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
            <h2 className="font-medium text-[#102820]">Push notifications</h2>
            <p className="mt-2 text-sm text-[#5C6F64]">Send alerts to users in a specific area.</p>
            <button type="button" className="mt-3 rounded-lg bg-[#003820] px-4 py-2 text-sm text-white">Create alert</button>
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
            <h2 className="font-medium text-[#102820]">Email digest</h2>
            <p className="mt-2 text-sm text-[#5C6F64]">Weekly summary for business owners.</p>
            <button type="button" className="mt-3 rounded-lg border border-[#E8EDE9] px-4 py-2 text-sm">Send digest</button>
          </div>
        </div>
      </div>
    </DeskFrame>
  );
}
