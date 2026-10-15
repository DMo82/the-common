import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/door")({
  beforeLoad: () => {
    throw redirect({ to: "/owner", search: { section: "" } });
  },
});
