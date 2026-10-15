import { createFileRoute } from "@tanstack/react-router";
import { RoleDesk } from "@/components/desk/RoleDesk";
export const Route = createFileRoute("/desk/author")({ component: () => <RoleDesk title="News author desk" role="author" body="A news author can draft a local piece here later. Nothing publishes itself." next="The draft form is not open yet." /> });
