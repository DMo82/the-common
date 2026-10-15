import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BackButton, Card, Shell, backButtonClass } from "@/components/common/Shell";
import { dutiesFor } from "@/lib/common/staff";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/mod")({ component: ModPage });

type Queue = "verification" | "news" | "harm";

function ModPage() {
  const account = useCommon((state) => state.account);
  const grants = useCommon((state) => state.staffGrants);
  const allowed = dutiesFor(account?.email, grants ?? []).includes("admin");
  const [queue, setQueue] = useState<Queue>("verification");
  const businesses = useCommon((state) => state.businesses);
  const events = useCommon((state) => state.events);
  const news = useCommon((state) => state.news);
  const reports = useCommon((state) => state.reports);
  const listings = useCommon((state) => state.listings);
  const decide = useCommon((state) => state.decide);
  const closeReport = useCommon((state) => state.closeReport);

  const verification = [
    ...businesses.filter((row) => row.status === "pending" || row.status === "changes_requested").map((row) => ({ kind: "business" as const, id: row.id, title: row.name, detail: `${row.email} · ${row.phone} · ${row.postcode}` })),
    ...events.filter((row) => row.status === "pending").map((row) => ({ kind: "event" as const, id: row.id, title: row.title, detail: row.when })),
    ...(listings ?? []).filter((row) => row.status === "pending").map((row) => ({ kind: "listing" as const, id: row.id, title: row.title, detail: row.detail })),
  ];
  const waitingNews = news.filter((row) => row.status === "pending");
  const harm = reports.filter((row) => row.status === "open");

  if (!allowed) {
    return (
      <Shell>
        <Card>
          <h1 className="text-3xl font-semibold">Console</h1>
          <p className="mt-2 text-sm text-muted">This is an admin desk. It stays closed unless the super user has allocated admin on your account.</p>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="grid gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Console</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Three queues. A person decides. The moderator seat and the safeguarding lead are empty, so a decision here is a Stage 0 test, not an appointment.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["verification", `Verification ${verification.length}`],
              ["news", `News ${waitingNews.length}`],
              ["harm", `Harm ${harm.length}`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`min-h-11 rounded-full px-4 text-sm ${queue === key ? "bg-primary text-on-primary" : "border border-line bg-surface"}`}
              onClick={() => setQueue(key)}
            >
              {label}
            </button>
          ))}
        </div>
        {queue === "verification"
          ? verification.map((item) => (
              <DecisionCard
                key={item.id}
                title={item.title}
                detail={item.detail}
                checklist={item.kind === "business"}
                onDecide={(status, reason, actor) => decide(item.kind, item.id, status, reason, actor)}
              />
            ))
          : null}
        {queue === "news"
          ? waitingNews.map((item) => (
              <DecisionCard
                key={item.id}
                title={item.title}
                detail={`${item.source}. ${item.excerpt}`}
                checklist={false}
                onDecide={(status, reason, actor) => decide("news", item.id, status, reason, actor)}
              />
            ))
          : null}
        {queue === "harm"
          ? harm.map((item) => (
              <Card key={item.id}>
                <h2 className="font-semibold">{item.target}</h2>
                <p className="mt-1 text-sm">{item.body}</p>
                <p className="text-sm text-muted">From {item.from}</p>
                <button
                  type="button"
                  className="mt-3 min-h-11 rounded-full bg-primary px-4 text-sm font-medium text-on-primary"
                  onClick={() => closeReport(item.id, "Left up. Sample outcome.", "Stage 0 reviewer")}
                >
                  Close report
                </button>
              </Card>
            ))
          : null}
        {queue === "verification" && verification.length === 0 ? <Card>Nothing waiting in verification.</Card> : null}
        {queue === "news" && waitingNews.length === 0 ? <Card>No news is waiting. Nothing was auto-published.</Card> : null}
        {queue === "harm" && harm.length === 0 ? <Card>No open reports.</Card> : null}
      </div>
    </Shell>
  );
}

function DecisionCard({
  title,
  detail,
  checklist,
  onDecide,
}: {
  title: string;
  detail: string;
  checklist: boolean;
  onDecide: (status: "published" | "changes_requested" | "refused", reason: string, actor: string) => void;
}) {
  const [email, setEmail] = useState(false);
  const [phone, setPhone] = useState(false);
  const [address, setAddress] = useState(false);
  const [proof, setProof] = useState(false);
  const [lookalike, setLookalike] = useState(false);
  const [reason, setReason] = useState("");
  const [needReason, setNeedReason] = useState(false);
  const ready = !checklist || (email && phone && address && proof && lookalike);

  function refuseOrReturn(status: "changes_requested" | "refused") {
    if (!reason.trim()) {
      setNeedReason(true);
      return;
    }
    onDecide(status, reason.trim(), "Stage 0 reviewer");
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted">{detail}</p>
      {checklist ? (
        <div className="mt-3 grid gap-2 text-sm">
          <Check label="Working email" checked={email} onChange={setEmail} />
          <Check label="Working phone" checked={phone} onChange={setPhone} />
          <Check label="Address matches the pin" checked={address} onChange={setAddress} />
          <Check label="Companies House number or proof of trading" checked={proof} onChange={setProof} />
          <Check label="Lookalike check" checked={lookalike} onChange={setLookalike} />
        </div>
      ) : null}
      <label className="mt-3 grid gap-1 text-sm">
        Reason, required unless you approve
        <input className="min-h-11 rounded-xl border border-line bg-bg px-3" value={reason} onChange={(event) => { setReason(event.target.value); setNeedReason(false); }} />
      </label>
      {needReason ? <p className="mt-2 text-sm text-warn">A reason is required to ask for changes or to refuse. Approve does not need one.</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!ready}
          className="min-h-11 rounded-full bg-primary px-4 text-sm font-medium text-on-primary disabled:opacity-40"
          onClick={() => onDecide("published", "", "Stage 0 reviewer")}
        >
          Approve and publish
        </button>
        <button
          type="button"
          className="min-h-11 rounded-full border border-line px-4 text-sm"
          onClick={() => refuseOrReturn("changes_requested")}
        >
          Ask for changes
        </button>
        <button
          type="button"
          className="min-h-11 rounded-full border border-line px-4 text-sm"
          onClick={() => refuseOrReturn("refused")}
        >
          Refuse
        </button>
      </div>
    </Card>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}
