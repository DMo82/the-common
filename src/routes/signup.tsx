import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BackButton, Card, Shell, backButtonClass } from "@/components/common/Shell";
import { LAMBETH_NEIGHBOURHOODS } from "@/lib/common/boundaries";
import { type AccountKind } from "@/lib/common/model";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search.next === "string" && search.next.startsWith("/") ? search.next : "/account",
    email: typeof search.email === "string" && search.email.includes("@") ? search.email.trim().toLowerCase() : "",
  }),
  component: SignupPage,
});

function SignupPage() {
  const { next, email: carried } = Route.useSearch();
  const setAccount = useCommon((state) => state.setAccount);
  const directory = useCommon((state) => state.directory);
  const blockUnder18 = useCommon((state) => state.blockUnder18);
  const ageBlocked = useCommon((state) => state.ageBlocked);
  const [roles, setRoles] = useState<AccountKind[]>(["resident"]);
  const [surname, setSurname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(carried);
  const [organisation, setOrganisation] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [neighbourhood, setNeighbourhood] = useState("");
  const [note, setNote] = useState("");
  const [over18, setOver18] = useState(false);
  const [taken, setTaken] = useState(false);

  return (
    <Shell>
      <Card>
        <h1 className="break-words font-serif text-3xl leading-tight font-medium">Sign up</h1>
        <p className="mt-2 text-sm text-muted">We ask only enough to know who you are. The listing, the event, the article or the business page comes afterwards.</p>
        {carried ? <p className="mt-3 rounded-xl bg-band px-3 py-2 text-sm">That email was not recognised, so you can register it here.</p> : null}
        <form
          className="mt-4 grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!over18) {
              blockUnder18();
              return;
            }
            const key = email.trim().toLowerCase();
            if ((directory ?? []).some((row) => row.email === key || row.username === key)) {
              setTaken(true);
              return;
            }
            const kind = roles[0] || "resident";
            setAccount({
              name: `${name.trim()} ${surname.trim()}`.trim(),
              surname: surname.trim(),
              photo,
              kind,
              roles,
              approved: roles.every((role) => role === "resident" || role === "business" || role === "organiser" || role === "club"),
              email: email.trim(),
              username: email.trim().toLowerCase(),
              passwordHash: password,
              organisation: organisation.trim(),
              roleTitle: roleTitle.trim(),
              neighbourhood,
              note: note.trim(),
              
            });
            window.location.assign("/account");
          }}
        >
          <label className="grid gap-1 text-sm">Profile picture
            <input type="file" accept="image/*" className="text-sm" onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => setPhoto(String(reader.result || ""));
              reader.readAsDataURL(file);
            }} />
            {photo ? <img src={photo} alt="" className="h-16 w-16 rounded-full object-cover" /> : null}
          </label>
          <label className="grid gap-1 text-sm">First name
            <input className="min-h-11 rounded-xl border border-line bg-bg px-3" value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label className="grid gap-1 text-sm">Surname
            <input className="min-h-11 rounded-xl border border-line bg-bg px-3" value={surname} onChange={(event) => setSurname(event.target.value)} required />
          </label>
          <label className="grid gap-1 text-sm">Password<input type="password" className="min-h-11 rounded-xl border border-line bg-bg px-3" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} /></label>
          <label className="grid gap-1 text-sm">Email
            <input type="email" className="min-h-11 rounded-xl border border-line bg-bg px-3" value={email} onChange={(event) => { setEmail(event.target.value); setTaken(false); }} required placeholder="you@example.com" />
          </label>
          <label className="grid gap-1 text-sm">Home neighbourhood
            <select className="min-h-11 rounded-xl border border-line bg-bg px-3" value={neighbourhood} onChange={(event) => setNeighbourhood(event.target.value)} required>
              <option value="">Choose an area</option>
              {LAMBETH_NEIGHBOURHOODS.map((area) => <option key={area} value={area}>{area}</option>)}
            </select>
          </label>
          <fieldset className="grid gap-2 text-sm">
            <legend>I am signing up as. You can choose more than one.</legend>
            {([
              ["resident", "Public"],
              ["business", "Business"],
              ["organiser", "Event organiser"],
              ["council", "Council"],
              ["club", "Social club or church"],
              ["journalist", "Journalist"],
            ] as [AccountKind, string][]).map(([id, label]) => (
              <label key={id} className="flex items-center gap-2"><input type="checkbox" checked={roles.includes(id)} onChange={(event) => setRoles((current) => event.target.checked ? [...current, id] : current.filter((role) => role !== id))} />{label}</label>
            ))}
          </fieldset>
          <p className="text-sm text-muted">Council and journalist wait for approval. A business page and an event are approved before they are public. A business has a three month trial, then £10 a month.</p>
          <p className="text-sm text-muted">Registration is free. You can look around before you register. Replies, bookings and tickets open once you have an account. A business, event organiser or social club dashboard appears on your profile. Monthly billing is set up only after that page is completed and approved. A business has a three month trial first.</p>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={over18} onChange={(event) => setOver18(event.target.checked)} />
            I confirm I am 18 or over and I accept the terms and privacy notice.
          </label>
          <p className="text-sm"><Link to="/legal" search={{ page: "terms" }} className="font-medium text-primary">Terms</Link> and <Link to="/legal" search={{ page: "privacy" }} className="font-medium text-primary">privacy</Link></p>
          {ageBlocked ? <p className="rounded-xl bg-warn-bg px-3 py-2 text-sm text-warn">Accounts are 18+. You can keep browsing.</p> : null}
          {taken ? <p className="text-sm text-warn">That email is already registered. Use a different one or log in.</p> : null}
          <div className="flex items-center justify-between gap-3">
            <Link to="/login" search={{ next }} className="min-h-11 shrink-0 rounded-full border border-line px-4 py-3 text-sm font-medium">Log in</Link>
            <button type="submit" className="ml-auto min-h-11 shrink-0 rounded-full bg-primary px-4 text-sm font-medium text-on-primary">Register</button>
          </div>
        </form>
      </Card>
    </Shell>
  );
}
