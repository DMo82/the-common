import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ReportModal } from "@/components/common/ReportModal";
import { BackButton, Shell, backButtonClass } from "@/components/common/Shell";
import { useCommon } from "@/lib/common/store";
import { useState } from "react";
import { ModeratorEdit } from "@/components/desk/ModeratorEdit";
import { Keep } from "@/components/common/Keep";
import { visibleNews } from "@/lib/common/model";
import { pictureFor } from "@/lib/common/pictures";

export const Route = createFileRoute("/news/$id")({
  validateSearch: (search: Record<string, unknown>) => ({
    from: search.from === "saved" || search.from === "favourite" || search.from === "desk" ? search.from : "",
  }),
  component: NewsArticle,
});

function NewsArticle() {
  const { id } = Route.useParams();
  const { from } = Route.useSearch();
  const navigate = useNavigate();
  const item = useCommon((state) => state.news).find((row) => row.id === id);
  const report = useCommon((state) => state.report);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportRef, setReportRef] = useState("");

  if (!item || (item.status !== "published" && from !== "desk")) {
    return (
      <Shell>
        <h1 className="text-xl font-semibold">This story is not public</h1>
      </Shell>
    );
  }

  const paragraphs = item.article?.length ? item.article : [item.lead || item.excerpt];

  return (
    <Shell>
      {from === "desk" ? <ModeratorEdit kind="news" id={item.id} fields={[{ key: "title", label: "Title", value: item.title }, { key: "excerpt", label: "Description", value: item.excerpt }, { key: "source", label: "Source", value: item.source }]} media={{ image: item.image }} /> : null}
      <article className="min-w-0 overflow-hidden">
        <div className="relative overflow-hidden">
          <img
              src={item.image || pictureFor(`${item.title} ${item.excerpt}`, "news")}
              alt=""
              className="block h-56 w-full max-w-full object-cover"
              style={{
                maskImage: "linear-gradient(to bottom, black 72%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 72%, transparent 100%)",
              }}
            />
          <Keep overlay id={item.id} next={`/news/${item.id}`} title={item.title} />
        </div>
        <div className={item.image ? "relative z-20 -mt-14 grid gap-4" : "relative z-20 grid gap-4"}>
          <p className="text-xs tracking-wide text-muted">
            <span className="mr-2 rounded-md bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">{item.neighbourhood}</span>
            {item.source} · 3 min read
          </p>
          <div className="relative z-20"><h1 className="min-w-0 break-words font-serif text-4xl leading-tight text-deep">{item.title}</h1></div>
          <p className="text-sm italic text-muted">By {item.source}</p>
          <p className="font-serif text-lg italic">{item.excerpt}</p>
          {paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)} className="text-base leading-relaxed">{paragraph}</p>
          ))}
          {item.posted ? <p className="text-xs text-muted">{item.posted}</p> : null}{item.author ? <p className="text-sm text-muted">By {item.author}{item.email ? ` · ${item.email}` : ""}{item.phone ? ` · ${item.phone}` : ""}</p> : null}<button type="button" className="text-sm font-medium text-primary" onClick={() => navigator.share ? navigator.share({ title: item.title, url: window.location.href }) : navigator.clipboard.writeText(window.location.href)}>Share</button><a href={item.href} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary">
            Read the original on {item.source}
          </a>
          <button type="button" className="min-h-11 w-fit rounded-full border border-line px-4 text-sm" onClick={() => setReportOpen(true)}>{reportRef ? `Report sent · ${reportRef}` : "Report"}</button>
          <ReportModal open={reportOpen} target="article" onClose={() => setReportOpen(false)} onSend={(reason, detail) => { const id = report(item.title, detail, reason); setReportRef(id); return id; }} />
            </div>
      </article>
    </Shell>
  );
}
