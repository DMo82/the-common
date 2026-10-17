export function BulkBar({ count, onAction, onClear }: { count: number; onAction: (action: string) => void; onClear: () => void }) {
  if (count === 0) return null;
  return (
    <div className="sticky bottom-4 flex items-center justify-between rounded-xl border border-[#E8EDE9] bg-white px-4 py-3 shadow-lg">
      <span className="text-sm font-medium">{count} selected</span>
      <div className="flex gap-2">
        <button type="button" onClick={() => onAction("approve")} className="rounded-lg bg-[#306830] px-3 py-1.5 text-sm text-white">Approve</button>
        <button type="button" onClick={() => onAction("decline")} className="rounded-lg bg-[#8A1C1C] px-3 py-1.5 text-sm text-white">Decline</button>
        <button type="button" onClick={onClear} className="rounded-lg border border-[#E8EDE9] px-3 py-1.5 text-sm">Clear</button>
      </div>
    </div>
  );
}
