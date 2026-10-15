import type { ReactNode } from "react";

export function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[480px] flex-col border-l border-[#E8EDE9] bg-white">
        <header className="flex items-center justify-between border-b border-[#E8EDE9] px-5 py-4">
          <h2 className="text-lg font-bold text-[#102820]">{title}</h2>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-lg border border-line" onClick={onClose} aria-label="Close">✕</button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}
