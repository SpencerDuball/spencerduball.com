import { Box } from "@chakra-ui/react";
import { getUser } from "~/session.server";
import { LoaderArgs, redirect } from "@remix-run/node";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUser(request, "required");

  // ensure user is admin
  if (!user.roles?.includes("admin")) throw redirect("/");

  return null;
};

export default function Dashboard() {
  return <Box>Hello!</Box>;
}
