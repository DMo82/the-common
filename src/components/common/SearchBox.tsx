import { useState, type FormEvent } from "react";

export type SearchValues = { name: string; user: string; from: string; to: string };

export function SearchBox({ values, onChange, onSearch, labels }: { values: SearchValues; onChange: (next: SearchValues) => void; onSearch?: () => void; labels?: { name?: string; user?: string; namePlaceholder?: string; userPlaceholder?: string } }) {
  const [open, setOpen] = useState(true);
  function set(key: keyof SearchValues, value: string) {
    onChange({ ...values, [key]: value });
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    onSearch?.();
  }
  return (
    <form className="search-box min-w-0 overflow-hidden rounded-2xl border border-line bg-white p-4" onSubmit={submit}>
      <button type="button" className="flex w-full items-center justify-between text-sm font-medium" onClick={() => setOpen((value) => !value)}>
        <span>Search</span>
        <span className="text-xs text-muted">{open ? "Hide" : "Show"}</span>
      </button>
      {open ? (
        <div className="mt-3 grid min-w-0 gap-3">
          <Field label={labels?.name || "Name"} value={values.name} onChange={(value) => set("name", value)} placeholder={labels?.namePlaceholder || "Title"} />
          <Field label={labels?.user || "User"} value={values.user} onChange={(value) => set("user", value)} placeholder={labels?.userPlaceholder || "Owner or author"} />
          <div className="grid min-w-0 grid-cols-2 gap-2">
            <DateField label="From" value={values.from} onChange={(value) => set("from", value)} placeholder="Start date" />
            <DateField label="To" value={values.to} onChange={(value) => set("to", value)} placeholder="End date" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="h-8 rounded-full bg-primary px-3 text-xs font-medium text-on-primary">Search</button>
            <button type="button" className="h-8 rounded-full border border-line px-3 text-xs font-medium" onClick={() => onChange({ name: "", user: "", from: "", to: "" })}>Clear</button>
          </div>
        </div>
      ) : null}
    </form>
  );
}

export function DateField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  const shown = value ? value.split("-").reverse().join("/") : placeholder;
  return (
    <label className="grid min-w-0 gap-1 text-[11px] font-medium text-muted">
      {label}
      <span className="relative block h-11 min-w-0 overflow-hidden rounded-xl border border-line bg-white">
        <span className={`pointer-events-none absolute inset-0 flex items-center truncate px-3 text-sm ${value ? "text-fg" : "text-muted"}`}>{shown}</span>
        <input type="date" value={value} aria-label={label} onChange={(event) => onChange(event.target.value)} className="absolute inset-0 h-full w-full opacity-0" />
      </span>
    </label>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="grid min-w-0 gap-1 text-[11px] font-medium text-muted">
      {label}
      <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="box-border h-11 w-full min-w-0 rounded-xl border border-line bg-white px-3 text-sm text-fg" />
    </label>
  );
}
