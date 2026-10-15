import { useEffect, useState, type ReactNode } from "react";

export function CaptureShield({ children }: { children: ReactNode }) {
  const [covered, setCovered] = useState(true);

  useEffect(() => {
    let timer = 0;
    const hide = () => {
      window.clearTimeout(timer);
      setCovered(true);
    };
    const reveal = () => {
      window.clearTimeout(timer);
      if (document.visibilityState === "visible" && document.hasFocus()) setCovered(false);
    };
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const shot =
        event.key === "PrintScreen" ||
        event.code === "PrintScreen" ||
        (event.metaKey && event.shiftKey && ["3", "4", "5", "s"].includes(key)) ||
        (event.ctrlKey && event.shiftKey && key === "s");
      if (!shot) return;
      event.preventDefault();
      hide();
      timer = window.setTimeout(reveal, 2500);
    };
    const onVisible = () => (document.visibilityState === "visible" ? reveal() : hide());
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("blur", hide);
    window.addEventListener("focus", reveal);
    window.addEventListener("pagehide", hide);
    window.addEventListener("beforeprint", hide);
    window.addEventListener("afterprint", reveal);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("keyup", onKey, true);
    reveal();
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("blur", hide);
      window.removeEventListener("focus", reveal);
      window.removeEventListener("pagehide", hide);
      window.removeEventListener("beforeprint", hide);
      window.removeEventListener("afterprint", reveal);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("keyup", onKey, true);
    };
  }, []);

  return (
    <div className="capture-secret mt-4 select-none" style={{ WebkitTouchCallout: "none", userSelect: "none" }} onContextMenu={(event) => event.preventDefault()} onCopy={(event) => event.preventDefault()}>
      {covered ? <p className="rounded-2xl bg-band px-3 py-6 text-sm text-muted">Hidden. The QR and the code are covered while the screen may be captured.</p> : children}
    </div>
  );
}
