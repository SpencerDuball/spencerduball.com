import React from "react";
import { json } from "@remix-run/node";
import type { LinksFunction, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  ShouldRevalidateFunction,
  useLoaderData,
} from "@remix-run/react";
import styles from "./tailwind.css";
import Inter from "@fontsource-variable/inter/index.css";
import { z } from "zod";
import { userPrefs, newUserPrefs } from "~/lib/cookie.server";
import { Header } from "~/components/app/header";
import { GlobalContext, GlobalContextProvider } from "~/components/app/global-ctx";
import { ToasterProvider } from "~/components/app/toaster";
import { getSessionInfo } from "./lib/session.server";

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
];

export async function loader({ request }: LoaderArgs) {
  // get the theme preferences
  const preferences = await z
    .enum(["light", "dark"])
    .parseAsync(await userPrefs.parse(request.headers.get("cookie")))
    .catch(() => "dark" as const);

  // check if user is admin
  const session = await getSessionInfo(request);
  const isAdmin = !!session?.roles.includes("admin");

  return json({ theme: preferences, isAdmin }, { headers: { "Set-Cookie": await newUserPrefs(preferences, request) } });
}

export const shouldRevalidate: ShouldRevalidateFunction = ({ formAction, defaultShouldRevalidate }) => {
  if (formAction?.match(/\/dashboard\/cms\/blog\/\d+\/preview/)) return false;
  return defaultShouldRevalidate;
};

function AppContent() {
  // load theme
  const { theme, isAdmin } = useLoaderData<typeof loader>();
  const [{ _theme, clientLoaded }] = React.useContext(GlobalContext);

  return (
    <html lang="en" className={clientLoaded ? _theme : theme}>
      <head>
        <Meta />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Links />
      </head>
      <body className="bg-slate-1">
        <ToasterProvider>
          <div className="grid justify-items-center">
            <Header isAdmin={isAdmin} />
            <Outlet />
          </div>
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </ToasterProvider>
      </body>
    </html>
  );
}

export default function App() {
  return (
    <GlobalContextProvider>
      <AppContent />
    </GlobalContextProvider>
  );
}
