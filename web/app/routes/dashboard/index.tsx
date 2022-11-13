import { getUser } from "~/session.server";
import { LoaderArgs, redirect } from "@remix-run/node";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUser(request);

  if (!user?.roles?.includes("admin")) return redirect("/");
};
