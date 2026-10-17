import { createFileRoute } from "@tanstack/react-router";
import { DeskFrame } from "@/components/desk/DeskFrame";

export const Route = createFileRoute("/desk/settings")({ component: SettingsDesk });

function SettingsDesk() {
  return (
    <DeskFrame>
      <div className="grid gap-4">
        <h1 className="text-2xl font-bold text-[#102820]">Settings & Audit</h1>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
            <h2 className="font-medium text-[#102820]">Feature flags</h2>
            <div className="mt-3 grid gap-2">
              <label className="flex items-center justify-between text-sm"><span>Push notifications</span><input type="checkbox" disabled /></label>
              <label className="flex items-center justify-between text-sm"><span>Email digest</span><input type="checkbox" disabled /></label>
              <label className="flex items-center justify-between text-sm"><span>Ticket sales</span><input type="checkbox" disabled /></label>
            </div>
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
            <h2 className="font-medium text-[#102820]">Audit log</h2>
            <p className="mt-2 text-sm text-[#5C6F64]">Recent actions by staff.</p>
            <div className="mt-3 text-xs text-[#5C6F64]">No recent entries.</div>
          </div>
        </div>
      </div>
    </DeskFrame>
  );
}
