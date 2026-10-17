import { createFileRoute } from "@tanstack/react-router";
import { DeskFrame } from "@/components/desk/DeskFrame";

export const Route = createFileRoute("/desk/content")({ component: ContentDesk });

function ContentDesk() {
  return (
    <DeskFrame>
      <div className="grid gap-4">
        <h1 className="text-2xl font-bold text-[#102820]">Content</h1>
        <p className="text-sm text-[#5C6F64]">News articles and moderation.</p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
            <h2 className="font-medium text-[#102820]">News</h2>
            <p className="mt-1 text-2xl font-bold text-[#102820]">42</p>
            <p className="text-xs text-[#5C6F64]">6 pending approval</p>
          </div>
          <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
            <h2 className="font-medium text-[#102820]">Flagged</h2>
            <p className="mt-1 text-2xl font-bold text-[#8A1C1C]">3</p>
            <p className="text-xs text-[#5C6F64]">Needs review</p>
          </div>
        </div>
      </div>
    </DeskFrame>
  );
}
