import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/desk/content")({ component: ContentDesk });

const TABS = ["News", "Promotions sent", "Categories"] as const;

function ContentDesk() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("News");
  const news = useCommon((s) => s.news);
  const promotions = useCommon((s) => s.promotions ?? []);

  return (
    <div className="mx-auto grid max-w-3xl gap-3">
      <h1 className="font-serif text-3xl text-deep">Content</h1>
      <div className="flex gap-1">
        {TABS.map((t) => (
          <button key={t} type="button" className={`rounded-full px-3 py-1 text-xs font-medium ${tab === t ? "bg-[#003820] text-white" : "border border-[#E8EDE9] bg-white"}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      <div className="rounded-xl border border-[#E8EDE9] bg-white p-4">
        {tab === "News" ? (
          <div className="grid gap-2">
            {news.length === 0 ? <p className="text-sm text-muted">No news articles.</p> : null}
            {news.slice(0, 10).map((n) => (
              <div key={n.id} className="rounded-lg border border-line p-2">
                <p className="font-medium">{n.title}</p>
                <p className="text-xs text-muted">{n.neighbourhood} · {n.status}</p>
              </div>
            ))}
          </div>
        ) : null}
        {tab === "Promotions sent" ? (
          <div className="grid gap-2">
            {promotions.length === 0 ? <p className="text-sm text-muted">No promotions sent.</p> : null}
            {promotions.slice(0, 10).map((p) => (
              <div key={p.id} className="rounded-lg border border-line p-2">
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-muted">{p.status}</p>
              </div>
            ))}
          </div>
        ) : null}
        {tab === "Categories" ? <p className="text-sm text-muted">Category management coming soon.</p> : null}
      </div>
    </div>
  );
}
