import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DeskFrame } from "@/components/desk/DeskFrame";

export const Route = createFileRoute("/desk")({
  component: () => (
    <DeskFrame>
      <Outlet />
    </DeskFrame>
  ),
});
