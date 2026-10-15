import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AreaBar, useHere } from "@/components/common/AreaBar";
import { BackButton, Shell, backButtonClass } from "@/components/common/Shell";
import { visibleNews, type NewsItem } from "@/lib/common/model";
import { pictureFor } from "@/lib/common/pictures";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    keep: search.keep === "saved" || search.keep === "favourite" ? search.keep : "",
  }),
  component: NewsPage,
});

function Story({ item, local, first, open, onToggle, from }: { item: NewsItem; local: boolean; first: boolean; open: boolean; onToggle: () => void; from: "" | "saved" | "favourite" }) {
  const photo = item.image || pictureFor(`${item.title} ${item.excerpt}`, "news");
  return (
    <article className="min-w-0 max-w-full overflow-hidden">
      <button type="button" onClick={onToggle} aria-expanded={open} className="block w-full min-w-0 max-w-full text-left">
        {local ? (
          <span className="relative block overflow-hidden rounded-3xl">
            <img loading="lazy" decoding="async" src={photo} alt="" className="block h-64 w-full object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <span className="absolute bottom-3 left-3 right-3 text-white">
              <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-semibold">{item.neighbourhood}</span>
              <span className="ml-2 text-[10px]">12d ago</span>
              <span className="mt-2 block font-serif text-2xl leading-tight">{item.title}</span>
              <span className="mt-1 block text-sm text-white/85">{item.excerpt}</span>{item.posted ? <span className="mt-1 block text-xs text-white/75">{item.posted}</span> : null}
            </span>
          </span>
        ) : (
          <span className="grid grid-cols-[1fr_5.5rem] items-start gap-3 border-b border-line py-3">
            <span>
              <span className="text-[10px] tracking-wide text-muted"><span className="mr-2 rounded-md bg-primary px-1.5 py-0.5 font-semibold text-white">{item.neighbourhood}</span>{item.source}</span>
              <span className="mt-1 block font-serif text-lg leading-tight">{item.title}</span>{item.posted ? <span className="block text-xs text-muted">{item.posted}</span> : null}
            </span>
            {<img loading="lazy" decoding="async" src={photo} alt="" className="h-16 w-full rounded-xl object-cover" />}
          </span>
        )}
      </button>
      {open ? (
        <div className="mt-2 grid gap-2">
          {!local ? (
          <span className="block overflow-hidden rounded-2xl shadow-[0_10px_24px_-16px_rgba(16,40,32,0.7)]">
              <img loading="lazy" decoding="async" src={photo} alt="" className="h-40 w-full object-cover" />
            </span>
          ) : null}
          <p className="text-base leading-relaxed">{item.lead || item.excerpt}</p>
          <Link to="/news/$id" params={{ id: item.id }} search={{ from }} className="text-sm font-medium text-primary">
            Read more
          </Link>
        </div>
      ) : null}
    </article>
  );
}

function NewsPage() {
  const { keep } = Route.useSearch();
  const news = visibleNews(useCommon((state) => state.news));
  const saves = useCommon((state) => state.saves ?? []);
  const favourites = useCommon((state) => state.favourites ?? []);
  const here = useHere();
  const [open, setOpen] = useState<string | null>(null);
  const picked = keep === "saved" ? saves : keep === "favourite" ? favourites : null;
  const publicNews = news.filter((row) => row.status === "published" && (!picked || picked.includes(row.id)));
  const lead = publicNews.filter((row) => (row.neighbourhood || "Clapham") === here.neighbourhood);
  const rest = publicNews.filter((row) => (row.neighbourhood || "Clapham") !== here.neighbourhood);
  const title = keep === "saved" ? "Saved news" : keep === "favourite" ? "Favourite news" : "";

  function toggle(id: string) {
    setOpen((current) => (current === id ? null : id));
  }

  if (keep) {
    return (
      <Shell>
        <div className="grid w-full min-w-0 max-w-full gap-2">
          <div>
            <h1 className="text-2xl leading-none font-medium">{title}</h1>
          </div>
          {publicNews.length === 0 ? <p className="text-sm text-muted">Nothing here yet. Use the buttons on a story.</p> : null}
          {publicNews.map((item) => (
            <Story key={item.id} item={item} local={false} first={false} open={open === item.id} onToggle={() => toggle(item.id)} from={keep === "favourite" ? "favourite" : "saved"} />
          ))}
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="grid w-full min-w-0 max-w-full gap-2">
        {lead.length === 0 ? (
          <>
            <h1 className="font-serif text-3xl text-deep">Lambeth · News</h1>
            <AreaBar here={here} />
            <p className="text-sm text-muted">Nothing fresh in {here.neighbourhood} just yet. The neighbours below may have something.</p>
          </>
        ) : (
          lead.map((item, index) => (
            <div key={item.id} className="min-w-0 max-w-full">
              <Story item={item} local first={index === 0} open={open === item.id} onToggle={() => toggle(item.id)} from="" />
              {index === 0 ? (
                <div className="mt-3 min-w-0 max-w-full">
                  <AreaBar here={here} />
                </div>
              ) : null}
            </div>
          ))
        )}
        {rest.length ? <p className="pt-2 text-xs tracking-[0.14em] text-muted">ALSO IN LAMBETH</p> : null}
        {rest.map((item) => (
          <Story key={item.id} item={item} local={false} first={false} open={open === item.id} onToggle={() => toggle(item.id)} from="" />
        ))}
        <p className="text-sm text-muted">Tap a headline if you have a moment. Read more when you actually want the whole thing.</p>
      </div>
    </Shell>
  );
}
