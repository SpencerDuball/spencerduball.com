import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/404")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="grid h-full w-full place-items-center">
      <div className="grid gap-4">
        <h1 className="text text-8xl font-bold">404</h1>
        <Button size="lg" variant="link" nativeButton={false} render={<Link to="/" />}>
          Back To Home
        </Button>
      </div>
    </div>
  );
}
