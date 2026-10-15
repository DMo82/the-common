import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, Shell } from "@/components/common/Shell";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function read(key: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback;
  const value = window.localStorage.getItem(key);
  return value === null ? fallback : value === "1";
}

function SettingsPage() {
  const [dark, setDark] = useState(false);
  const [messages, setMessages] = useState(true);
  const [decisions, setDecisions] = useState(true);
  const [offers, setOffers] = useState(false);

  useEffect(() => {
    setDark(read("common-dark", false));
    setMessages(read("common-notify-messages", true));
    setDecisions(read("common-notify-decisions", true));
    setOffers(read("common-notify-offers", false));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    window.localStorage.setItem("common-dark", dark ? "1" : "0");
  }, [dark]);

  function save(key: string, value: boolean, setter: (next: boolean) => void) {
    setter(value);
    window.localStorage.setItem(key, value ? "1" : "0");
  }

  return (
    <Shell>
      <Card>
        <div>
          <h1 className="font-serif text-3xl text-deep">Settings</h1>
        </div>
        <section className="mt-4 grid gap-3">
          <label className="flex items-center justify-between gap-3 rounded-2xl border border-line p-4 text-sm">
            <span>Dark mode</span>
            <input type="checkbox" checked={dark} onChange={(event) => setDark(event.target.checked)} />
          </label>
          <h2 className="font-serif text-2xl text-deep">Notifications</h2>
          <label className="flex items-center justify-between gap-3 rounded-2xl border border-line p-4 text-sm">
            <span>Messages</span>
            <input type="checkbox" checked={messages} onChange={(event) => save("common-notify-messages", event.target.checked, setMessages)} />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-2xl border border-line p-4 text-sm">
            <span>Approval decisions</span>
            <input type="checkbox" checked={decisions} onChange={(event) => save("common-notify-decisions", event.target.checked, setDecisions)} />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-2xl border border-line p-4 text-sm">
            <span>Offers from places I follow</span>
            <input type="checkbox" checked={offers} onChange={(event) => save("common-notify-offers", event.target.checked, setOffers)} />
          </label>
        </section>
      </Card>
    </Shell>
  );
}
