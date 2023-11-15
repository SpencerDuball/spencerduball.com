import type { MetaFunction } from "@remix-run/node";

export async function loader() {
  throw new Response(undefined, { status: 404, statusText: "Not Found" });
}

export const meta: MetaFunction = () => [{ title: "Not Found | Spencer Duball" }];

export default function CatchAll() {
  return <></>;
}

export { ErrorBoundary } from "~/lib/app/error-boundary";
