import { redirect, V2_MetaFunction } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";
import { getSessionInfo } from "~/lib/session.server";
import { logRequest } from "~/lib/util.server";

export const meta: V2_MetaFunction = () => [
  { title: "Dashboard | Spencer Duball" },
  { name: "description", content: "Take a look at recent activity, errors that require attention, and admin tools." },
];

export async function loader({ request }: LoaderArgs) {
  await logRequest(request);

  // check if user is admin
  const session = await getSessionInfo(request, "required");
  if (!session.roles.includes("admin")) return redirect("/");

  return null;
}

export default function Dashboard() {
  return (
    <div className="w-full max-w-5xl py-6 px-4">
      <p className="text-5xl">Welcome to the Dashboard!</p>
    </div>
  );
}
