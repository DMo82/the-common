import { Link } from "@tanstack/react-router";

type Related = { type: string; id: string; title: string; href: string };

export function RelatedRecords({ records }: { records: Related[] }) {
  if (records.length === 0) return null;
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase text-[#5C6F64]">Related</p>
      <div className="mt-2 grid gap-1">
        {records.map((r) => (
          <Link key={r.id} to={r.href as "/"} className="flex items-center justify-between rounded-lg border border-[#E8EDE9] px-3 py-2 text-sm hover:bg-[#E8EDE9]">
            <span>{r.title}</span>
            <span className="text-xs text-[#5C6F64]">{r.type}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
