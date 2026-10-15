import { useState } from "react";
import { CopyAssist } from "@/components/common/CopyAssist";
import { useCommon } from "@/lib/common/store";

type Field = { key: string; label: string; value: string };

export function ModeratorEdit({ kind, id, fields, media }: { kind: "business" | "event" | "listing" | "news"; id: string; fields: Field[]; media?: { logo?: string; cover?: string; gallery?: string[]; image?: string } }) {
  const moderateEdit = useCommon((state) => state.moderateEdit);
  const [values, setValues] = useState(Object.fromEntries(fields.map((field) => [field.key, field.value])));
  const [logo, setLogo] = useState(media?.logo || "");
  const [cover, setCover] = useState(media?.cover || "");
  const [gallery, setGallery] = useState(media?.gallery || ["", "", "", ""]);
  const [image, setImage] = useState(media?.image || "");
  const [note, setNote] = useState("");
  const descriptionKey = kind === "business" ? "about" : kind === "news" ? "excerpt" : "detail";
  function save() {
    setNote(moderateEdit(kind, id, { ...values, logo, cover, gallery: gallery.join("|"), image }));
  }
  return (
    <form className="grid gap-3 rounded-2xl border border-line bg-white p-3" onSubmit={(event) => { event.preventDefault(); save(); }}>
      <p className="text-sm font-medium">Edit this page</p>
      {kind === "business" ? (
        <>
          <Picture label="Logo" value={logo} onChange={setLogo} round />
          <Picture label="Hero picture" value={cover} onChange={setCover} />
          <div className="grid grid-cols-2 gap-2">
            {gallery.map((slot, index) => <Picture key={index} label={`Picture ${index + 1}`} value={slot} onChange={(value) => setGallery(gallery.map((row, position) => position === index ? value : row))} />)}
          </div>
        </>
      ) : (
        <Picture label="Picture" value={image} onChange={setImage} />
      )}
      {fields.map((field) => (
        <label key={field.key} className="grid gap-1 text-sm">
          {field.label}
          {field.key === descriptionKey ? (
            <>
              <textarea rows={4} value={values[field.key] || ""} onChange={(event) => setValues({ ...values, [field.key]: event.target.value })} className="rounded-xl border border-line px-3 py-2" />
              {kind === "business" || kind === "event" ? <CopyAssist kind={kind} name={values.name || values.title || ""} notes={values[field.key] || ""} place={values.address || values.place || ""} when={values.when || ""} onDraft={(text) => setValues({ ...values, [field.key]: text })} /> : null}
            </>
          ) : (
            <input value={values[field.key] || ""} onChange={(event) => setValues({ ...values, [field.key]: event.target.value })} className="min-h-11 rounded-xl border border-line px-3" />
          )}
        </label>
      ))}
      <button className="h-10 w-fit rounded-full bg-primary px-4 text-sm font-medium text-on-primary">Save changes</button>
      {note ? <p className="text-sm text-muted">{note}</p> : null}
    </form>
  );
}

function Picture({ label, value, onChange, round = false }: { label: string; value: string; onChange: (value: string) => void; round?: boolean }) {
  return (
    <label className="grid gap-1 text-sm">
      <span>{label}</span>
      {value ? <img src={value} alt="" className={`${round ? "h-16 w-16 rounded-full" : "h-24 w-full rounded-xl"} object-cover bg-band`} /> : <span className="grid h-16 place-items-center rounded-xl bg-band text-xs text-muted">No picture</span>}
      <input type="file" accept="image/*" className="text-xs" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => onChange(String(reader.result || "")); reader.readAsDataURL(file); }} />
    </label>
  );
}
