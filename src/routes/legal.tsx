import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, Card } from "@/components/common/Shell";

export const Route = createFileRoute("/legal")({
  validateSearch: (search: Record<string, unknown>) => ({
    page: ["privacy", "cookies", "company", "community", "accessibility", "refunds", "organiser", "complaints"].includes(String(search.page)) ? String(search.page) : search.page === "terms" || !search.page ? "terms" : "missing",
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
          {page === "missing" ? "Page not found" : page === "privacy" ? "Privacy" : page === "cookies" ? "Cookies" : page === "company" ? "Company details" : page === "community" ? "Community Policy" : page === "accessibility" ? "Accessibility" : page === "refunds" ? "Refunds and cancellation" : page === "organiser" ? "Organiser terms" : page === "complaints" ? "Complaints and appeals" : "Terms"}
        </h1>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link to="/legal" search={{ page: "terms" }} className="font-medium text-primary">Terms</Link>
          <Link to="/legal" search={{ page: "privacy" }} className="font-medium text-primary">Privacy</Link>
          <Link to="/legal" search={{ page: "cookies" }} className="font-medium text-primary">Cookies</Link>
          <Link to="/legal" search={{ page: "community" }} className="font-medium text-primary">Community Policy</Link>
          <Link to="/legal" search={{ page: "complaints" }} className="font-medium text-primary">Complaints</Link>
          <Link to="/legal" search={{ page: "refunds" }} className="font-medium text-primary">Refunds</Link>
          <Link to="/legal" search={{ page: "organiser" }} className="font-medium text-primary">Organiser terms</Link>
          <Link to="/legal" search={{ page: "accessibility" }} className="font-medium text-primary">Accessibility</Link>
          <Link to="/legal" search={{ page: "company" }} className="font-medium text-primary">Company</Link>
        </div>
        {page === "missing" ? <p className="mt-4 text-sm">That page was not found. <Link to="/legal" search={{ page: "terms" }} className="font-medium text-primary">Read the terms</Link>.</p> : null}
        {page === "terms" ? (
          <div className="mt-4 grid gap-3 text-sm leading-relaxed">
            <p>These terms cover the Stage 0 preview of the Lambeth neighbourhood app run by The Common Community.</p>
            <p>You must be 18 or over to create an account, book, message, report, or post. You may look around if you are under 18, but you cannot register.</p>
            <p>Bookings, messages, reports, and CV uploads stay on this device. They are not sent to a business, the police, the fire service, or the council. Event tickets are free at launch.</p>
            <p>Events and listings can be refused. A published page can be taken down. This preview can change without notice.</p>
          </div>
        ) : null}
        {page === "privacy" ? (
          <div className="mt-4 grid gap-3 text-sm leading-relaxed">
            <p>Version 1.4 · Last updated 15 October 2026</p>
            <p>The controller is THE COMMON COMMUNITY LTD, a private limited company registered in England and Wales, company number 17493696, registered office 68 Bryn-Y-Nant, Cardiff, CF23 9PA.</p>
            <p>Contact: support@thecommon.community. ICO registration number will be published before launch.</p>
            <p>We use your name, email and home area to run your account (contract). We use reports and messages to keep the community safe (legitimate interest). Location is used only if you allow it (consent).</p>
            <p>We keep accounts while you use the app, and for six years after if the law requires it. Enquiries are kept for 12 months. You can ask for a copy of your data, or ask us to erase it. We reply within one month.</p>
            <p>You may complain to the ICO: ico.org.uk/make-a-complaint, 0303 123 1113, Wycliffe House, Water Lane, Wilmslow, Cheshire SK9 5AF.</p>
            <p>To request erasure or a copy of your data, email support@thecommon.community. We have received your request and will reply within one month.</p>
          </div>
        ) : null}
        {page === "cookies" ? (
          <div className="mt-4 grid gap-3 text-sm leading-relaxed">
            <p>Version 1.3 · Last updated 15 October 2026</p>
            <p>We use strictly necessary cookies and storage to run The Common. Analytics cookies are used only if you accept them.</p>
            <table className="w-full text-left text-xs">
              <thead><tr className="border-b border-line"><th className="py-1 pr-2">Name</th><th className="py-1 pr-2">Provider</th><th className="py-1 pr-2">Purpose</th><th className="py-1 pr-2">Category</th><th className="py-1">Expiry</th></tr></thead>
              <tbody>
                <tr className="border-b border-line"><td className="py-1 pr-2">tc_consent</td><td className="py-1 pr-2">The Common</td><td className="py-1 pr-2">Stores your cookie choice</td><td className="py-1 pr-2">Strictly necessary</td><td className="py-1">12 months</td></tr>
                <tr className="border-b border-line"><td className="py-1 pr-2">__cf_bm</td><td className="py-1 pr-2">Cloudflare</td><td className="py-1 pr-2">Bot management and security</td><td className="py-1 pr-2">Strictly necessary</td><td className="py-1">30 minutes</td></tr>
                <tr><td className="py-1 pr-2">__vdpl</td><td className="py-1 pr-2">Hosting platform</td><td className="py-1 pr-2">Session and security</td><td className="py-1 pr-2">Strictly necessary</td><td className="py-1">Session</td></tr>
              </tbody>
            </table>
            <p>Questions: support@thecommon.community</p>
          </div>
        ) : null}
        {page === "community" ? <div className="mt-4 grid gap-3 text-sm leading-relaxed"><p>Version 0.5 · Last updated 15 October 2026</p><p>Be kind. Do not harass, scam, or post anything illegal. Reports go to a person at The Common. A knowingly false report is itself a breach.</p><p>Questions: support@thecommon.community</p></div> : null}
        {page === "accessibility" ? <div className="mt-4 grid gap-3 text-sm leading-relaxed"><p>Version 0.5 · Last updated 15 October 2026</p><p>We aim to meet WCAG 2.2 AA. A full check will be recorded before launch.</p><p>Known gaps: some contrast on muted text, heading order on a few routes, and some form fields need a clearer label. These will be closed before the pilot opens.</p><p>Questions: support@thecommon.community</p></div> : null}
        {page === "refunds" ? <div className="mt-4 grid gap-3 text-sm leading-relaxed"><p>Version 0.5 · Last updated 15 October 2026</p><p>Events are free during the pilot. There is nothing to refund. If a paid event is cancelled later, the organiser refunds the ticket in full.</p><p>Questions: support@thecommon.community</p></div> : null}
        {page === "organiser" ? <div className="mt-4 grid gap-3 text-sm leading-relaxed"><p>Version 0.5 · Last updated 15 October 2026</p><p>By submitting an event you agree to these terms. Events are free at launch. Guests reserve a free place. You must not charge for a place through the app during the pilot.</p><p>Questions: support@thecommon.community</p></div> : null}
        {page === "complaints" ? <div className="mt-4 grid gap-3 text-sm leading-relaxed"><p>Version 0.5 · Last updated 15 October 2026</p><p>Write to support@thecommon.community. We reply within 14 days. If you are not satisfied, you may appeal within 14 days of the decision.</p><p>THE COMMON COMMUNITY LTD · Company no. 17493696 · 68 Bryn-Y-Nant, Cardiff, CF23 9PA</p></div> : null}
        {page === "company" ? (
          <div className="mt-4 grid gap-3 text-sm leading-relaxed">
            <p>THE COMMON COMMUNITY LTD, a private limited company registered in England and Wales.</p>
            <p>Company number 17493696. Incorporated on 1 October 2026.</p>
            <p>Registered office: 68 Bryn-Y-Nant, Cardiff, United Kingdom, CF23 9PA.</p>
            <p>The registered email is not shown. Companies House does not publish it.</p>
            <p>The app launches on 1 February 2027 across all of Lambeth as a 3-month pilot. Business pages are free for 30 days, then £10 a month. A charity, social group, club or church is £5 a month after the same trial. No VAT is charged. Contact support@thecommon.community.</p>
            <a className="font-medium text-primary" href="https://find-and-update.company-information.service.gov.uk/company/17493696" target="_blank" rel="noreferrer">View the public register</a>
          </div>
        ) : null}
      </Card>
    </Shell>
  );
}
