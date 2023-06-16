import { redirect } from "@remix-run/node";
import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { getSessionInfo } from "~/lib/session.server";
import { logRequest } from "~/lib/util.server";

export async function loader({ request }: LoaderArgs) {
  await logRequest(request);

  // check if user is admin
  const session = await getSessionInfo(request, "required");
  if (!session.roles.includes("admin")) return redirect("/");

  return null;
}

export const meta: V2_MetaFunction = () => [
  { title: "Analytics | Spencer Duball" },
  {
    name: "description",
    content:
      "View the analytics for spencerduball.com as a whole. Track errors, where users are visiting from, and which routes get the most attention.",
  },
];

export default function Analytics() {
  return (
    <div className="w-full max-w-5xl py-6 px-4">
      <p className="text-5xl">Welcome to the Analytics!</p>
    </div>
  );
}
