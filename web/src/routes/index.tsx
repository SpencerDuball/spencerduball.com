import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Component,
});

export function Component() {
  return <div className="grid border border-red-500">hello</div>;
}
