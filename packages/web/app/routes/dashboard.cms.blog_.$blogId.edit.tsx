import { Editor } from "~/lib/ui/editor";
import { LoaderFunctionArgs } from "@remix-run/node";
import { logger } from "~/lib/util/globals.server";
import { getSessionInfo } from "~/lib/util/utils.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const log = logger(request);

  // check if user is admin
  const session = await getSessionInfo(request);
  if (!session?.roles.includes("admin")) throw new Response(null, { status: 403 });

  return new Response(null, { status: 200 });
}

export default function BlogIdEdit() {
  return <Editor className="h-full w-full" />;
}
