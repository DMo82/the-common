import { Link } from "@tanstack/react-router";
import { DeskFrame } from "@/components/desk/DeskFrame";
import { useCommon } from "@/lib/common/store";

export function RoleDesk({ title, role, body, next }: { title: string; role: string; body: string; next: string }) {
  const account = useCommon((state) => state.account);
  const allowed = account?.email?.toLowerCase() === "dvmorris.dm@gmail.com" || account?.kind === role;
  if (!allowed) {
    return <DeskFrame><p className="text-sm">This desk is for the {title.toLowerCase()} role.</p><Link to="/account" search={{ next: "/desk" }} className="mt-3 inline-block text-sm font-medium text-primary">Back to profile</Link></DeskFrame>;
  }
  return (
    <DeskFrame>
      <h1 className="font-serif text-3xl text-deep">{title}</h1>
      <p className="mt-2 text-sm text-muted">{body}</p>
      <div className="mt-4 grid gap-2 rounded-2xl border border-line bg-white p-4 text-sm">
        <p><span className="text-muted">Signed in as </span>{account?.name}</p>
        <p><span className="text-muted">Role </span>{role.replaceAll("_", " ")}</p>
        <p>{next}</p>
      </div>
    </DeskFrame>
  );
}
