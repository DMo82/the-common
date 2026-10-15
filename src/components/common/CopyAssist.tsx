import { useState } from "react";
import { draftCopy } from "@/lib/common/draft";

export function CopyAssist({
  kind,
  name,
  notes,
  when,
  place,
  onDraft,
}: {
  kind: "business" | "event";
  name: string;
  notes: string;
  when?: string;
  place?: string;
  onDraft: (text: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="grid gap-1">
      <button
        type="button"
        disabled={busy}
        className="min-h-11 w-fit rounded-full border border-line px-4 text-sm font-medium disabled:opacity-60"
        onClick={() => {
          setBusy(true);
          setError("");
          void draftCopy({ data: { kind, name, notes, when, place } })
            .then((result) => {
              if (!result.ok) {
                setError(result.error);
                return;
              }
              onDraft(result.text);
            })
            .catch(() => setError("The writing help could not finish. Try again."))
            .finally(() => setBusy(false));
        }}
      >
        {busy ? "Writing…" : "Help me write this"}
      </button>
      {error ? <p className="text-xs text-warn">{error}</p> : <p className="text-xs text-muted">A clear draft from your notes. You can edit it before you save.</p>}
    </div>
  );
}
