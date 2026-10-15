import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, Card } from "@/components/common/Shell";

export const Route = createFileRoute("/legal")({
  validateSearch: (search: Record<string, unknown>) => ({
    page: search.page === "privacy" || search.page === "cookies" || search.page === "company" ? search.page : "terms",
  }),
  component: LegalPage,
});

function LegalPage() {
  const { page } = Route.useSearch();
  return (
    <Shell>
      <Card>
        <p className="text-xs font-semibold tracking-[0.14em] text-primary">THE COMMON COMMUNITY</p>
        <h1 className="mt-2 font-serif text-3xl text-deep">
          {page === "privacy" ? "Privacy" : page === "cookies" ? "Cookies" : page === "company" ? "Company details" : "Terms"}
        </h1>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link to="/legal" search={{ page: "terms" }} className="font-medium text-primary">Terms</Link>
          <Link to="/legal" search={{ page: "privacy" }} className="font-medium text-primary">Privacy</Link>
          <Link to="/legal" search={{ page: "cookies" }} className="font-medium text-primary">Cookies</Link>
          <Link to="/legal" search={{ page: "company" }} className="font-medium text-primary">Company</Link>
        </div>
        {page === "terms" ? (
          <div className="mt-4 grid gap-3 text-sm leading-relaxed">
            <p>These terms cover the Stage 0 preview of the Lambeth neighbourhood app run by The Common Community.</p>
            <p>You must be 18 or over to create an account, book, message, report, or post. You may look around if you are under 18, but you cannot register.</p>
            <p>Bookings, messages, reports, and CV uploads stay on this device. They are not sent to a business, the police, the fire service, or the council. Nothing is paid through the app.</p>
            <p>Events and listings can be refused. A published page can be taken down. This preview can change without notice.</p>
          </div>
        ) : null}
        {page === "privacy" ? (
          <div className="mt-4 grid gap-3 text-sm leading-relaxed">
            <p>Account name, email, home area, favourites, follows, and bookings are stored on this phone for the preview. They are not sent to a server you can rely on yet.</p>
            <p>Location is used only if you allow it, to put your neighbourhood first and to draw a route. We do not sell it.</p>
            <p>Incident reports and photos stay on this phone. Do not use them as a report to the police or fire service. Call 999 if someone is in danger.</p>
            <p>You can stop using the account with Log out. A full delete request will be added when accounts are held off the device.</p>
          </div>
        ) : null}
        {page === "cookies" ? (
          <div className="mt-4 grid gap-3 text-sm leading-relaxed">
            <p>Essential storage keeps you signed in and remembers that you confirmed you are 18 or over.</p>
            <p>Measures storage counts page views, sign-ups, sign-ins, favourites, bookings, reports, and messages on this phone. It is off until you allow it.</p>
            <p>There is no advertising cookie and no third-party tracker in this preview.</p>
          </div>
        ) : null}
        {page === "company" ? (
          <div className="mt-4 grid gap-3 text-sm leading-relaxed">
            <p>THE COMMON COMMUNITY LTD, a private limited company registered in England and Wales.</p>
            <p>Company number 17493696. Incorporated on 1 October 2026.</p>
            <p>Registered office: 68 Bryn-Y-Nant, Cardiff, United Kingdom, CF23 9PA.</p>
            <p>The registered email is not shown. Companies House does not publish it.</p>
            <p>The app is a Stage 0 neighbourhood preview for Lambeth. Stripe is not connected. Payments are not taken.</p>
            <a className="font-medium text-primary" href="https://find-and-update.company-information.service.gov.uk/company/17493696" target="_blank" rel="noreferrer">View the public register</a>
          </div>
        ) : null}
      </Card>
    </Shell>
  );
}
