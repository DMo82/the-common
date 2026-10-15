import { createFileRoute, Link, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/saved")({
  beforeLoad: () => {
    throw redirect({ to: "/", search: { keep: "favourite" } });
  },
  component: () => null,
});
