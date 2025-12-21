import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/posts/$page")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="grid justify-items-center">
      <div className="grid w-full max-w-4xl px-4 py-12">Hello</div>
    </div>
  );
}
