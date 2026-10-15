import { createFileRoute } from "@tanstack/react-router";
import { RoleDesk } from "@/components/desk/RoleDesk";
export const Route = createFileRoute("/desk/charity")({ component: () => <RoleDesk title="Charity desk" role="charity" body="A charity can prepare its page here later. Nothing is public until an admin approves it." next="The public page and donation form are not open yet." /> });
