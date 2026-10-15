import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/common/Shell";

export const Route = createFileRoute("/$")({
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <Shell>
      <div className="grid place-items-center gap-4 py-8 text-center">
        <img src="/brand/logo.png" alt="The Common" className="h-24 w-auto" />
        <h1 className="font-serif text-3xl text-deep">We couldn't find that page</h1>
        <p className="text-sm text-muted">It may have moved. Head back to the latest from Lambeth.</p>
        <Link to="/" search={{ keep: "" }} className="min-h-12 rounded-full bg-[#003820] px-6 py-3 text-base font-semibold text-white">Back to Lambeth news</Link>
        <a href="mailto:support@thecommon.community" className="text-sm font-medium text-primary">Contact support</a>
      </div>
    </Shell>
  );
}
