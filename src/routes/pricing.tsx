import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, Shell } from "@/components/common/Shell";

export const Route = createFileRoute("/pricing")({ component: PricingPage });

function PricingPage() {
  return (
    <Shell>
      <Card>
        <h1 className="font-serif text-3xl text-deep">Pricing</h1>
        <p className="mt-2 text-sm text-muted">Both plans have a 30-day free trial. No VAT is charged.</p>
        <div className="mt-4 grid gap-3">
          <div className="rounded-2xl border border-line p-4">
            <h2 className="font-serif text-2xl text-deep">Business</h2>
            <p className="mt-1 text-2xl font-medium">£10 a month</p>
            <p className="mt-1 text-sm text-muted">30-day free trial. Your card is taken at sign-up and first charged on day 31. Cancel any time in the trial and you will not be charged.</p>
          </div>
          <div className="rounded-2xl border border-line p-4">
            <h2 className="font-serif text-2xl text-deep">Charity, social group, club or church</h2>
            <p className="mt-1 text-2xl font-medium">£5 a month</p>
            <p className="mt-1 text-sm text-muted">30-day free trial. Same rules as the business plan.</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted">THE COMMON COMMUNITY LTD is the merchant of record. Company no. 17493696 · 68 Bryn-Y-Nant, Cardiff, CF23 9PA · support@thecommon.community</p>
        <Link to="/signup" search={{ next: "/pricing", email: "" }} className="mt-3 inline-block text-sm font-medium text-primary">Start free trial</Link>
      </Card>
    </Shell>
  );
}
