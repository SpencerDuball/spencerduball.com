import type { LoaderFunction } from "@remix-run/node";
import type { UserType } from "table";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUser } from "~/session.server";

interface LoaderData {
  user: UserType;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  return json({ user });
};

export default function New() {
  const { user } = useLoaderData<LoaderData>();

  return (
    <>
      <h1>New Blog Post</h1>
      <p>Hello there {user.name}!</p>
    </>
  );
}
