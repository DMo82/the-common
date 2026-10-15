import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/common/Shell";
import { LAMBETH_NEIGHBOURHOODS } from "@/lib/common/boundaries";
import { canAccess } from "@/lib/common/staff";
import { pictureFor } from "@/lib/common/pictures";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/desk/journalist")({ component: JournalistDesk });

function JournalistDesk() {
  const account = useCommon((state) => state.account);
  const submitNews = useCommon((state) => state.submitNews);
  const news = useCommon((state) => state.news);
  const requestNewsChange = useCommon((state) => state.requestNewsChange);
  const notifications = useCommon((state) => state.notifications ?? []);
  const markNotificationRead = useCommon((state) => state.markNotificationRead);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [href, setHref] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(account?.email || "");
  const [author, setAuthor] = useState(account?.name || "");
  const [area, setArea] = useState(account?.neighbourhood || "Clapham");
  const [image, setImage] = useState("");
  const [note, setNote] = useState("");
  const mine = news.filter((row) => row.author === account?.name || row.email === account?.email);
  const allowed = canAccess(account?.email, account?.kind, "journalist");
  if (!allowed) return <div><h1 className="font-serif text-3xl text-deep">Journalist desk</h1><p className="mt-2 text-sm text-muted">This desk is for a journalist account.</p></div>;
  return (
    <div>
      <h1 className="font-serif text-3xl text-deep">Journalist desk</h1>
      <p className="mt-1 text-sm text-muted">Write a story and send it for approval. It is not public until admin or the super user approves it.</p>
      {notifications.filter((row) => row.forRole === "journalist" && row.forName === account?.name).length ? <div className="mt-3 grid gap-2">{notifications.filter((row) => row.forRole === "journalist" && row.forName === account?.name).map((row) => <button type="button" key={row.id} className={`rounded-2xl border px-3 py-2 text-left text-sm ${row.read ? "border-line" : "border-primary bg-band"}`} onClick={() => markNotificationRead(row.id)}>{row.body}</button>)}</div> : null}
      <form className="mt-4 grid gap-2" onSubmit={(event) => {
        event.preventDefault();
        const ok = submitNews({ title, excerpt, source: author, neighbourhood: area, href, image, author, phone, email });
        setNote(ok ? "Sent for approval. The decision will arrive in your inbox." : "Add a headline and the story.");
        if (ok) { setTitle(""); setExcerpt(""); setHref(""); }
      }}>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Headline" required className="min-h-11 rounded-xl border border-line px-3" />
        <textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} placeholder="The story" required rows={5} className="rounded-xl border border-line px-3 py-2" />
        <label className="text-sm">Image<input type="file" accept="image/*" className="mt-1 block text-xs" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setImage(String(reader.result || "")); reader.readAsDataURL(file); }} /></label>
        {<img src={image || pictureFor(`${title} ${excerpt}`, "news")} alt="" className="h-16 w-16 rounded-lg object-cover" />}
        <input value={href} onChange={(event) => setHref(event.target.value)} placeholder="Link to the source website" className="min-h-11 rounded-xl border border-line px-3" />
        <input value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="Author name" className="min-h-11 rounded-xl border border-line px-3" />
        <select value={area} onChange={(event) => setArea(event.target.value)} className="min-h-11 rounded-xl border border-line px-3">{LAMBETH_NEIGHBOURHOODS.map((name) => <option key={name}>{name}</option>)}</select>
        <button className="min-h-11 w-fit rounded-full bg-primary px-4 text-sm text-white">Submit for approval</button>
        {note ? <p className="text-sm text-muted">{note}</p> : null}
      </form>
      <div className="mt-4 grid gap-3">{mine.map((row) => <article key={row.id} className="rounded-2xl border border-line p-3 text-sm"><img src={row.image || pictureFor(`${row.title} ${row.excerpt}`, "news")} alt="" className="mb-2 h-24 w-full rounded-xl object-cover" /><p className="font-medium">{row.title}</p><p className="text-muted">{row.status === "published" ? "Approved" : row.status === "refused" ? "Declined" : "Pending"} · {row.views || 0} views</p><form className="mt-2 grid gap-2" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); requestNewsChange({ newsId: row.id, action: "edit", title: String(data.get("title") || row.title), excerpt: String(data.get("excerpt") || row.excerpt), href: String(data.get("href") || row.href) }); }}><input name="title" defaultValue={row.title} className="min-h-11 rounded-xl border border-line px-3" /><textarea name="excerpt" defaultValue={row.excerpt} rows={3} className="rounded-xl border border-line px-3 py-2" /><input name="href" defaultValue={row.href} placeholder="Website" className="min-h-11 rounded-xl border border-line px-3" /><button className="w-fit text-sm font-medium text-primary">Submit edit</button></form><button type="button" className="mt-2 text-sm text-warn" onClick={() => requestNewsChange({ newsId: row.id, action: "delete" })}>Request deletion</button></article>)}</div>
    </div>
  );
}
