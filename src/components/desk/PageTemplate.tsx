import type { ReactNode } from "react";

export function PageTemplate({ title, scope, kpis, filters, children, footer }: {
  title: string;
  scope?: string;
  kpis?: { label: string; value: string | number; note?: string }[];
  filters?: ReactNode;
  children: ReactNode;
  footer?: string;
}) {
  return (
    <div className="grid gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#102820]">{title}</h1>
          {scope ? <p className="mt-1 text-sm text-[#5C6F64]">{scope}</p> : null}
        </div>
      </header>
      {kpis && kpis.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {kpis.slice(0, 4).map((kpi) => (
            <div key={kpi.label} className="rounded-xl border border-[#E8EDE9] bg-white p-3">
              <p className="text-xs font-semibold uppercase text-[#5C6F64]">{kpi.label}</p>
              <p className="mt-1 text-2xl font-bold text-[#102820]">{kpi.value}</p>
              {kpi.note ? <p className="text-xs text-[#5C6F64]">{kpi.note}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
      {filters ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#E8EDE9] bg-white p-3">
          {filters}
        </div>
      ) : null}
      <div className="min-w-0">{children}</div>
      {footer ? <p className="text-xs text-[#5C6F64]">{footer}</p> : null}
    </div>
  );
}
