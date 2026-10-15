import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { BackButton, Card, Shell, backButtonClass } from "@/components/common/Shell";
import { CaptureShield } from "@/components/common/CaptureShield";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/ticket/$id")({ component: TicketPage });

function TicketPage() {
  const { id } = Route.useParams();
  const reservation = useCommon((state) => state.reservations.find((row) => row.id === id));
  const event = useCommon((state) => state.events.find((row) => row.id === reservation?.eventId));
  const [svg, setSvg] = useState("");
  const [showCode, setShowCode] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    if (!reservation) return;
    let cancelled = false;
    void QRCode.toString(reservation.code, { type: "svg", margin: 1, width: 220 }, (error: Error | null | undefined, markup: string) => {
      if (!cancelled && !error) setSvg(markup);
    });
    return () => {
      cancelled = true;
    };
  }, [reservation]);

  if (!reservation) {
    return (
      <Shell>
        <Card>
          <h1 className="text-xl font-semibold">No reservation on this phone</h1>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <Card>
        <p className="text-xs tracking-wide text-muted">
          {event?.neighbourhood ? (
            <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">{event.neighbourhood}</span>
          ) : null}
          Free reservation · stays on this phone
        </p>
        <div className="mt-2">
          {event ? <Link to="/event/$id" params={{ id: event.id }} search={{ from: "" }} className="min-w-0 break-words font-serif text-3xl leading-tight font-medium text-deep">{event.title}</Link> : <h1 className="font-serif text-3xl">Ticket</h1>}
        </div>
        {event ? <Link to="/event/$id" params={{ id: event.id }} search={{ from: "" }} className="mt-1 block text-sm text-primary">{event.when} · {event.place}</Link> : null}
        <p className="mt-1 text-sm">{reservation.accountName}</p>
        <CaptureShield>
          <div className="max-w-56 overflow-hidden rounded-2xl bg-surface" dangerouslySetInnerHTML={{ __html: svg }} />
          {showCode ? <p className="mt-3 break-all text-sm">{reservation.code}</p> : null}
        </CaptureShield>
        <button
          type="button"
          className="mt-3 min-h-11 rounded-full border border-line px-4 text-sm font-medium"
          onClick={() => setShowCode((open) => !open)}
        >
          {showCode ? "Hide manual code" : "Show manual code"}
        </button>
        <p className="mt-2 text-sm text-muted">
          The written code stays hidden unless the door cannot scan the QR. The QR and the code cover themselves if this page leaves the screen, is printed, or a screenshot shortcut is used. A browser cannot stop the phone itself from taking a screenshot. That block waits for the store app. The door needs a signal to record the count, and a second scan will not count.
        </p>
        {reservation.scannedAt ? <p className="mt-2 text-sm">Counted at the door.</p> : null}
        {event ? <Link to="/event/$id" params={{ id: event.id }} search={{ from: "" }} className="mt-3 inline-flex text-sm font-medium text-primary">Event page</Link> : null}

      </Card>
    </Shell>
  );
}
