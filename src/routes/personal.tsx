import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Shell } from "@/components/common/Shell";
import { LAMBETH_NEIGHBOURHOODS } from "@/lib/common/boundaries";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/personal")({ component: PersonalPage });

function PersonalPage() {
  const account = useCommon((state) => state.account);
  const setAccount = useCommon((state) => state.setAccount);
  const requestReset = useCommon((state) => state.requestReset);
  const [intro, setIntro] = useState(account?.note || "");
  const [email, setEmail] = useState(account?.email || "");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [note, setNote] = useState("");
  if (!account) return <Shell><Card><p>Sign in first.</p><Link to="/login" search={{ next: "/personal" }} className="text-primary">Log in</Link></Card></Shell>;
  const person = account;

  function save() {
    setAccount({ ...person, email, note: intro, passwordHash: password || person.passwordHash, name: person.name });
    setNote("Saved.");
  }

  function readPhoto(file: File) {
    const reader = new FileReader();
    reader.onload = () => setAccount({ ...person, photo: String(reader.result || ""), name: person.name });
    reader.readAsDataURL(file);
  }

  return (
    <Shell>
      <Card>
        <div>
          <h1 className="font-serif text-3xl text-deep">My Personal Profile</h1>
        </div>
        <label className="mt-4 grid gap-2 text-sm">Profile picture
          {person.photo ? <img src={person.photo} alt="" className="h-20 w-20 rounded-full object-cover" /> : null}
          <input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) readPhoto(file); }} />
        </label>
        <label className="mt-3 grid gap-1 text-sm">Introduction
          <textarea rows={4} className="rounded-xl border border-line px-3 py-2" value={intro} onChange={(event) => setIntro(event.target.value)} />
        </label>
        <label className="mt-3 grid gap-1 text-sm">Email
          <input className="min-h-11 rounded-xl border border-line px-3" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="mt-3 grid gap-1 text-sm">Telephone
          <input className="min-h-11 rounded-xl border border-line px-3" value={phone} onChange={(event) => setPhone(event.target.value)} />
        </label>
        <label className="mt-3 grid gap-1 text-sm">Change area
          <select className="min-h-11 rounded-xl border border-line px-3" value={person.neighbourhood || "Clapham"} onChange={(event) => setAccount({ ...person, neighbourhood: event.target.value, name: account.name })}>
            {LAMBETH_NEIGHBOURHOODS.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
        <label className="mt-3 grid gap-1 text-sm">New password
          <input type="password" className="min-h-11 rounded-xl border border-line px-3" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="min-h-11 rounded-full bg-primary px-4 text-sm font-medium text-white" onClick={save}>Save</button>
          <button type="button" className="min-h-11 rounded-full border border-line px-4 text-sm" onClick={() => setNote(requestReset(person.email || person.username || ""))}>Reset password</button>
        </div>
        {note ? <p className="mt-2 text-sm text-muted">{note}</p> : null}
      </Card>
    </Shell>
  );
}
