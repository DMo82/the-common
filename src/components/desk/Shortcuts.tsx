import { useEffect } from "react";

export function useShortcuts(handlers: { onApprove?: () => void; onDecline?: () => void; onNext?: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "a" && handlers.onApprove) handlers.onApprove();
      if (e.key === "d" && handlers.onDecline) handlers.onDecline();
      if (e.key === "n" && handlers.onNext) handlers.onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlers]);
}

export function ShortcutHint() {
  return (
    <p className="text-xs text-[#5C6F64]">
      Shortcuts: <kbd className="rounded border border-[#E8EDE9] px-1">a</kbd> approve · <kbd className="rounded border border-[#E8EDE9] px-1">d</kbd> decline · <kbd className="rounded border border-[#E8EDE9] px-1">n</kbd> next
    </p>
  );
}
