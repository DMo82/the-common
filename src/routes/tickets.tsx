import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Shell, backButtonClass } from "@/components/common/Shell";
import { startTicketCheckout } from "@/lib/common/stripe";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/tickets")({ component: TicketsPage });

function TicketsPage() {
  const navigate = useNavigate();
  const account = useCommon((state) => state.account);
  const reservations = useCommon((state) => state.reservations);
  const events = useCommon((state) => state.events);
  const mine = reservations.filter((row) => row.accountName === account?.name);
  const onSale = events.filter((row) => row.status === "published");
  const [eventId, setEventId] = useState(onSale[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [method, setMethod] = useState("card");
  const [note, setNote] = useState("");
  const chosen = onSale.find((row) => row.id === eventId);
  const price = 1000;

  async function pay() {
    if (!chosen) return;
    if (method !== "card") { setNote("Card is the payment method for now."); return; }
    setNote("Opening Stripe.");
    const result = await startTicketCheckout({ data: { title: chosen.title, quantity, amount: price, successUrl: `${window.location.origin}/tickets`, cancelUrl: `${window.location.origin}/tickets` } });
    if (!result.ok) { setNote(result.reason); return; }
    window.location.href = result.url;
  }

  return (
    <Shell>
      <Card>
        <div>
          <h1 className="font-serif text-3xl text-deep">My tickets</h1>
        </div>
        {mine.length === 0 ? <p className="mt-3 text-sm text-muted">No tickets yet.</p> : (
          <div className="mt-4 grid gap-3">
            {mine.map((row) => {
              const event = events.find((item) => item.id === row.eventId);
              return (
                <Link key={row.id} to="/ticket/$id" params={{ id: row.id }} className="rounded-2xl border border-line p-4">
                  <p className="font-medium">{event?.title ?? "Ticket"}</p>
                  <p className="mt-1 text-sm text-muted">{event?.when} · {event?.place}</p>
                </Link>
              );
            })}
          </div>
        )}
        <section className="mt-5 grid gap-3 border-t border-line pt-4">
          <h2 className="font-serif text-2xl text-deep">Buy a ticket</h2>
          <label className="grid gap-1 text-sm">Event
            <select className="min-h-11 rounded-xl border border-line px-3" value={eventId} onChange={(event) => setEventId(event.target.value)}>
              {onSale.map((row) => <option key={row.id} value={row.id}>{row.title}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm">Quantity
            <select className="min-h-11 rounded-xl border border-line px-3" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))}>
              {[1, 2, 3, 4].map((count) => <option key={count} value={count}>{count}</option>)}
            </select>
          </label>
          <fieldset className="grid gap-2 text-sm">
            <legend>Payment method</legend>
            <label className="flex items-center gap-2"><input type="radio" checked={method === "card"} onChange={() => setMethod("card")} /> Card, through Stripe</label>
          </fieldset>
          <p className="text-sm text-muted">{quantity} × £{(price / 100).toFixed(2)} · £{((price * quantity) / 100).toFixed(2)}</p>
          <button type="button" className="min-h-11 w-fit rounded-full bg-primary px-4 text-sm font-medium text-white" onClick={() => void pay()}>Pay with Stripe</button>
          {note ? <p className="text-sm text-muted">{note}</p> : null}
        </section>
      </Card>
    </Shell>
  );
}
