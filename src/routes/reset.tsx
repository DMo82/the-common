import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Shell } from "@/components/common/Shell";
import { useCommon } from "@/lib/common/store";
export const Route = createFileRoute("/reset")({
  validateSearch: (search: Record<string, unknown>) => ({ token: typeof search.token === "string" ? search.token : "" }),
  component: ResetPage,
});
function ResetPage() {
  const { token } = Route.useSearch();
  const resetPassword = useCommon((state) => state.resetPassword);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [note, setNote] = useState("");
  const score = [password.length >= 10, /[a-z]/.test(password) && /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  return <Shell><Card><h1 className="font-serif text-3xl text-deep">Reset password</h1><form className="mt-4 grid gap-3" onSubmit={(event) => { event.preventDefault(); if (password !== confirm || score < 3) { setNote("Use a stronger password and confirm it."); return; } setNote(resetPassword(token, password)); }}><label className="grid gap-1 text-sm">New password<input type="password" className="min-h-11 rounded-xl border border-line px-3" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={10} /></label><div className="h-2 overflow-hidden rounded-full bg-band"><div className="h-full bg-primary" style={{ width: `${score * 25}%` }} /></div><label className="grid gap-1 text-sm">Confirm password<input type="password" className="min-h-11 rounded-xl border border-line px-3" value={confirm} onChange={(event) => setConfirm(event.target.value)} required /></label><button className="min-h-11 rounded-full bg-primary px-4 text-sm text-white">Save password</button>{note ? <p className="text-sm">{note}</p> : null}</form></Card></Shell>;
}
