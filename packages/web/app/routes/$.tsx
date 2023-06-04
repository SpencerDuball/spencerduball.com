import { useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { RiAlarmWarningLine } from "react-icons/ri";
import { cn } from "~/lib/util";
import { ScrollArea, ScrollViewport } from "~/components/ui/scroll-box";
import { Response } from "@remix-run/node";
import type { V2_MetaFunction } from "@remix-run/node";

export async function loader() {
  throw new Response(undefined, { status: 404, statusText: "Not Found" });
}

export const meta: V2_MetaFunction = () => [{ title: "Not Found | Spencer Duball" }];

export default function CatchAll() {
  return <></>;
}

export { ErrorBoundary } from "~/components/app/error-boundary";
