import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BackButton, Card, Shell, backButtonClass } from "@/components/common/Shell";
import { useCommon } from "@/lib/common/store";
import { resetMessage } from "@/lib/common/mail";
import { sendSupportMail } from "@/lib/common/send-mail";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search.next === "string" && search.next.startsWith("/") ? search.next : "/account",
  }),
  component: LoginPage,
});

function LoginPage() {
  const { next } = Route.useSearch();
  const signInWithPassword = useCommon((state) => state.signInWithPassword);
  const requestReset = useCommon((state) => state.requestReset);
  const confirmAge = useCommon((state) => state.confirmAge);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [over18, setOver18] = useState(false);
  const [note, setNote] = useState("");

  return (
    <Shell>
      <Card>
        <h1 className="font-serif text-3xl">Log in</h1>
        <p className="mt-2 text-sm text-muted">Use your email and password. The profile shows your first and last name. Forgot password prepares a reset link for that email.</p>
        <form className="mt-4 grid gap-3" onSubmit={async (event) => {
          event.preventDefault();
          if (resetting) {
            const note = requestReset(username);
            const token = note.split("token=")[1] || "";
            const link = `${window.location.origin}/reset?token=${token}`;
            const message = resetMessage({ name: username, link });
            const sent = await sendSupportMail({ data: { to: username.trim().toLowerCase(), subject: message.subject, text: message.text } });
            setNote(sent.sent ? `Sent from support@thecommon.community to ${username}.` : note);
            return;
          }
          const result = signInWithPassword(username, password);
          if (result) { setNote(result); return; }
          if (!over18) { setNote("Confirm you are 18 or over."); return; }
          confirmAge(true);
          window.location.assign(next.startsWith("/") && !next.startsWith("//") ? next : "/");
        }}>
          <label className="grid gap-1 text-sm">Email<input type="email" className="min-h-11 rounded-xl border border-line px-3" value={username} onChange={(event) => setUsername(event.target.value)} required /></label>
          {resetting ? null : <label className="grid gap-1 text-sm">Password<input type="password" className="min-h-11 rounded-xl border border-line px-3" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>}
          {resetting ? null : <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={over18} onChange={(event) => setOver18(event.target.checked)} /> I am 18 or over</label>}
          <button className="min-h-11 rounded-full bg-primary px-4 text-sm font-medium text-white">{resetting ? "Email the reset link" : "Log in"}</button>
          <button type="button" className="text-left text-sm font-medium text-primary" onClick={() => setResetting((value) => !value)}>{resetting ? "Back to log in" : "Forgot password"}</button>
          {note ? <p role="alert" className="rounded-xl border border-warn bg-band px-3 py-2 text-sm text-warn">{note}</p> : null}
        </form>
        <p className="mt-4 text-sm">No account yet? <Link to="/signup" search={{ next, email: "" }} className="font-medium text-primary">Register</Link></p>
      </Card>
    </Shell>
  );
}
