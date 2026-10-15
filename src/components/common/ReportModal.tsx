import { useState } from "react";

const REASONS = [
  "I think this account belongs to someone under 18",
  "A safety or safeguarding concern about a person",
  "Harassment or bullying",
  "Hate or discrimination",
  "Scam or fraud",
  "Illegal goods or activity",
  "Spam",
  "False or misleading information",
  "Something else",
];

export function ReportModal({ open, target, onClose, onSend }: { open: boolean; target: string; onClose: () => void; onSend: (reason: string, detail: string) => string }) {
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [ref, setRef] = useState("");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-3 sm:place-items-center">
      <form className="grid w-full max-w-md gap-3 rounded-2xl bg-white p-4" onSubmit={(event) => { event.preventDefault(); if (!reason) return; setRef(onSend(reason, detail)); }}>
        <h2 className="font-serif text-xl text-deep">Report this {target}</h2>
        {ref ? (
          <div className="grid gap-2 text-sm">
            <p>Thanks – your report has been sent. Reference: {ref}. A person will look at it within 2 working days.</p>
            <a href="/legal?page=complaints" className="font-medium text-primary">How complaints and appeals work</a>
            <a href="mailto:support@thecommon.community" className="font-medium text-primary">Email support@thecommon.community</a>
            <button type="button" className="min-h-11 rounded-full border border-line" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <fieldset className="grid gap-1 text-sm">
              <legend className="mb-1 font-medium">Reason</legend>
              {REASONS.map((item) => (
                <label key={item} className="flex items-start gap-2"><input type="radio" name="reason" value={item} checked={reason === item} onChange={() => setReason(item)} />{item}</label>
              ))}
            </fieldset>
            <label className="grid gap-1 text-sm">Tell us more (optional)
              <textarea value={detail} onChange={(event) => setDetail(event.target.value.slice(0, 1000))} maxLength={1000} rows={3} className="rounded-xl border border-line px-3 py-2" />
            </label>
            <p className="text-xs text-muted">Your report goes to a person at The Common, not to the person you are reporting. In an emergency call 999.</p>
            <div className="flex gap-2">
              <button type="submit" disabled={!reason} className="min-h-11 flex-1 rounded-full bg-primary text-sm text-white disabled:opacity-50">Send report</button>
              <button type="button" className="min-h-11 flex-1 rounded-full border border-line text-sm" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
