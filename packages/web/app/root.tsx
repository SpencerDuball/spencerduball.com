import { json } from "@remix-run/node";
import type { LinksFunction, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import styles from "./tailwind.css";
import Inter from "@fontsource/inter/variable-full.css";
import { z } from "zod";
import { userPrefs, newUserPrefs } from "~/lib/cookie.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: Inter },
  { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
  { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
  { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
  { rel: "manifest", href: "/site.webmanifest" },
  { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#5bbad5" },
];

export const meta: V2_MetaFunction = () => [
  { title: "Spencer Duball" },
  { name: "msapplication-TileColor", content: "#2b5797" },
  { name: "theme-color", content: "#ffffff" },
];

export async function loader({ request }: LoaderArgs) {
  // get the theme preferences
  const preferences = await z
    .enum(["light", "dark"])
    .parseAsync(await userPrefs.parse(request.headers.get("cookie")))
    .catch(() => "dark" as const);

  return json(
    { theme: preferences, isAdmin: true },
    { headers: { "Set-Cookie": await newUserPrefs(preferences, request) } }
  );
}

function AppContent() {
  // load theme
  const { theme, isAdmin } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <Meta />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Links />
      </head>
      <body className="bg-slate-1">
        <div className="grid justify-items-center">
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return <AppContent />;
}
