import { useState } from "react";

export function ConfirmDialog({ open, title, message, onConfirm, onCancel, requireReason }: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
  requireReason?: boolean;
}) {
  const [reason, setReason] = useState("");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl bg-white p-5">
        <h2 className="text-lg font-bold text-[#102820]">{title}</h2>
        <p className="mt-2 text-sm text-[#5C6F64]">{message}</p>
        {requireReason ? (
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (required)" rows={2} className="mt-3 w-full rounded-lg border border-[#E8EDE9] px-3 py-2 text-sm" />
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg border border-[#E8EDE9] px-4 py-2 text-sm" autoFocus>Cancel</button>
          <button type="button" onClick={() => onConfirm(reason)} disabled={requireReason && reason.length < 5} className="rounded-lg bg-[#8A1C1C] px-4 py-2 text-sm text-white disabled:opacity-50">Confirm</button>
        </div>
      </div>
    </div>
  );
}
