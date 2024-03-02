import { Link } from "@remix-run/react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { getSessionInfo } from "~/lib/util/utils.server";
import { logger } from "~/lib/util/globals.server";

export async function loader({ request }: LoaderFunctionArgs) {
  logger(request);

  // check if user is admin
  const session = await getSessionInfo(request);
  if (!session?.roles.includes("admin")) throw new Response(null, { status: 403 });

  return null;
}

export const meta: MetaFunction = () => [
  { title: "Electronics | Spencer Duball" },
  { name: "description", content: "Manage your electronic project posts." },
];

export default function Electronics() {
  return (
    <div className="grid w-full justify-items-center">
      <div className="w-full max-w-5xl px-4 py-6">
        {/* Title Card */}
        <div className="grid gap-4 rounded-lg bg-green-5 p-4 shadow-md md:grid-flow-col md:p-6">
          <div className="grid gap-2">
            <h1 className="text-5xl font-extrabold leading-relaxed text-green-11">Electronics</h1>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/dashboard/cms/blog" className="focus-outline font-bold leading-relaxed text-gray-10">
                Blog
              </Link>
              <Link to="/dashboard/cms/software" className="focus-outline font-bold leading-relaxed text-gray-10">
                Software
              </Link>
              <Link to="/dashboard/cms/3d-print" className="focus-outline font-bold leading-relaxed text-gray-10">
                3D Print
              </Link>
              <Link to="/dashboard/cms/electronics" className="focus-outline font-bold leading-relaxed text-green-12">
                Electronics
              </Link>
            </div>
          </div>
          <div className="grid w-full gap-2 justify-self-end rounded-lg bg-green-3 px-4 py-5 shadow-sm md:w-64 md:px-6 md:py-6">
            <p className="text-slate-11">Projects</p>
            <p className="text-4xl font-extrabold">8</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ErrorBoundary } from "~/lib/app/error-boundary";
