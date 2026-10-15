import { ChatThread } from "@/components/common/ChatThread";
import { ReportModal } from "@/components/common/ReportModal";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BackButton, NeedsAccount, Shell, ViewOnly, backButtonClass } from "@/components/common/Shell";
import { ModeratorEdit } from "@/components/desk/ModeratorEdit";
import { Keep } from "@/components/common/Keep";
import { conditionLabel, listedAgo, listingTypeLabel, presentListing, visibleListings } from "@/lib/common/market";
import { pictureFor } from "@/lib/common/pictures";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/listing/$id")({
  validateSearch: (search: Record<string, unknown>) => ({
    from: search.from === "saved" || search.from === "favourite" || search.from === "desk" ? search.from : "",
  }),
  component: ListingPage,
});

function ListingPage() {
  const { id } = Route.useParams();
  const { from } = Route.useSearch();
  const listing = visibleListings(useCommon((state) => state.listings)).find((row) => row.id === id);
  const business = useCommon((state) => state.businesses.find((row) => row.id === listing?.businessId));
  const account = useCommon((state) => state.account);
  const messages = useCommon((state) => state.listingMessages ?? []);
  const messageListing = useCommon((state) => state.messageListing);
  const submitCv = useCommon((state) => state.submitCv);
  const report = useCommon((state) => state.report);
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportRef, setReportRef] = useState("");
  const block = useCommon((state) => state.block);
  const blocked = useCommon((state) => state.blocked ?? []);
  const [cvName, setCvName] = useState("");
  const [cvNote, setCvNote] = useState("");

  if (!listing || (listing.status !== "published" && from !== "desk")) {
    return (
      <Shell>
        <h1 className="text-xl font-semibold">This listing isn't available any more</h1>
        <Link to="/market" search={{ business: "", mine: "", create: "", keep: "" }} className="mt-3 inline-block text-sm font-medium text-primary">Back to Marketplace</Link>
      </Shell>
    );
  }

  const described = presentListing(listing);
  const thread = messages.filter((row) => row.listingId === listing.id);

  return (
    <Shell>
      <article className="grid gap-4">
        {from === "desk" ? <ModeratorEdit kind="listing" id={listing.id} fields={[{ key: "title", label: "Title", value: listing.title }, { key: "detail", label: "Description", value: listing.detail }, { key: "priceLabel", label: "Price", value: listing.priceLabel || "" }]} media={{ image: listing.image }} /> : null}
        <div className="relative overflow-hidden rounded-2xl bg-black shadow-[0_16px_32px_-20px_rgba(16,40,32,0.85)]">
          {described.video ? (
            <video src={described.video} poster={described.image || undefined} controls className="block max-h-80 w-full object-cover" />
          ) : (
            <img src={described.image || pictureFor(`${listing.title} ${described.category || ""}`, "listing")} alt="" className="block h-72 w-full object-cover" />
          )}
          <Keep overlay id={listing.id} next={`/listing/${listing.id}`} title={listing.title} />
        </div>
        <div>
          <p className="text-xs tracking-wide text-muted">
            <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">{described.category}</span>
            {described.subcategory}
          </p>
          {listing.status === "pending" ? <p className="mt-2 text-sm text-muted">Waiting for a person to publish this.</p> : null}
          <div className="mt-2 flex items-start justify-between gap-3">
            <h1 className="min-w-0 break-words font-serif text-3xl leading-tight">{listing.title}</h1>
            <p className="shrink-0 text-2xl font-semibold text-primary">{described.priceLabel || "Ask"}</p>
          </div>
          <p className="mt-2 text-sm text-muted">
            {described.subcategory} · {listingTypeLabel(described.listingType)}
            {described.condition ? ` · ${conditionLabel(described.condition)}` : ""}
          </p>
          {listedAgo(listing) ? <p className="mt-1 text-sm font-medium text-primary">Published {listedAgo(listing)}</p> : null}
          <p className="mt-4 leading-relaxed">{listing.detail}</p>
          {business ? (
            <Link to="/business/$id" params={{ id: business.id }} search={{ from: "" }} className="mt-3 inline-block text-sm font-medium text-primary">
              {business.name}
            </Link>
          ) : (
            <p className="mt-3 text-sm text-muted">Sample listing. No business is attached, so there is no enquiry.</p>
          )}
        </div>
        {business ? (
          <section className="rounded-2xl border border-line bg-white p-3">
            <h2 className="text-lg">Message {business.name}</h2>
            <p className="mt-1 text-sm text-muted">A note to {business.name}. Not a message to another neighbour, and it stays on this phone.</p>
<div className="mt-3"><ChatThread notes={thread} /></div>
          {account ? (
          <form
            className="mt-3 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const text = body.trim();
              if (!text) return;
              messageListing(listing.id, text);
              setBody("");
              setSent(true);
            }}
          >
            <input
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Message the business"
              className="min-h-11 flex-1 rounded-xl border border-line bg-white px-3"
            />
            <button type="submit" className="min-h-11 rounded-xl bg-primary px-4 text-sm font-medium text-white">
              Send
            </button>
          </form>
          ) : <div className="mt-3">{<NeedsAccount next={`/listing/${listing.id}`} />}</div>}
            {sent ? <p className="mt-2 text-xs text-muted">Sent to {business.name}.</p> : null}
          </section>
        ) : (
          <p className="text-sm text-muted">This sample has no business, so there is no enquiry.</p>
        )}
        {account ? (
        <div className="flex gap-2">
          <button type="button" className="min-h-11 w-fit rounded-xl border border-primary bg-white px-3 text-sm font-medium text-primary" onClick={() => setReportOpen(true)}>{reportRef ? `Report sent · ${reportRef}` : "Report"}</button>
          <button type="button" className="min-h-11 w-fit rounded-full border border-line px-4 text-sm" onClick={() => block(listing.id)}>{blocked.includes(listing.id) ? "Blocked" : "Block"}</button>
          <ReportModal open={reportOpen} target="listing" onClose={() => setReportOpen(false)} onSend={(reason, detail) => { const id = report(listing.title, detail, reason); setReportRef(id); return id; }} />
        </div>
        ) : null}
        <p className="text-xs text-muted">If someone is in danger, call 999. This is not an emergency service.</p>
        {listing.kind === "job" ? (
          <section className="rounded-2xl border border-line bg-white p-3">
            <h2 className="text-lg">Submit your CV</h2>
            <p className="mt-1 text-sm text-muted">
              Word or PDF, sent to {business?.name ?? "the employer"}. It stays on this phone in this preview.
            </p>
            {account ? (
            <form
              className="mt-3 grid gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (!cvName) {
                  setCvNote("Choose a Word or PDF file.");
                  return;
                }
                const ok = submitCv(listing.id, cvName);
                setCvNote(ok ? `Sent to ${business?.name ?? "the employer"}.` : "The CV was not sent.");
              }}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="text-sm"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const allowed = /\.(pdf|docx?)$/i.test(file.name);
                  if (!allowed) {
                    setCvName("");
                    setCvNote("Use a Word or PDF file.");
                    return;
                  }
                  if (file.size > 8_000_000) {
                    setCvName("");
                    setCvNote("That file is over 8MB. Send a smaller CV.");
                    return;
                  }
                  setCvName(file.name);
                  setCvNote("");
                }}
              />
              <button type="submit" className="min-h-11 rounded-xl bg-primary px-3 text-sm font-medium text-white">
                Submit your CV
              </button>
            </form>
            ) : <div className="mt-3">{<NeedsAccount next={`/listing/${listing.id}`} />}</div>}
            {cvNote ? <p className="mt-2 text-sm text-muted">{cvNote}</p> : null}
          </section>
        ) : null}
        </article>
    </Shell>
  );
}
