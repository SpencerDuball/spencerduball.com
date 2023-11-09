import React from "react";
import { cssBundleHref } from "@remix-run/css-bundle";
import { json } from "@remix-run/node";
import type { LinksFunction, MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import tailwind from "~/tailwind.css";
import Inter from "@fontsource-variable/inter/index.css";
import { preferences } from "~/lib/cookies";
import { z } from "zod";
import { GlobalContext, GlobalContextProvider } from "~/lib/context/global-ctx";
import { useHydrated } from "remix-utils/use-hydrated";

/**
 * SSR-ONLY
 * Accepts the HTTP request object, extracts the '__preferences' cookie, reads or defaults the session cookie's theme
 * attributes, and finally returns an object with the theme string and cookie to be set on HTTP response.
 *
 * @param request The HTTP request object.
 * @returns An object with the theme and new HTTP cookie value.
 */
async function handlePreferencesCookie(request: Request) {
  // Get the preferences cookie session, if it doesn't exist a blank session cookie will be created
  const prefs = await preferences.getSession(request.headers.get("cookie"));

  // If the 'theme' attribute of the preferences cookie exists, set the 'theme value of the cookie as the same. If it
  // doesn't exist, default it to 'dark'. It's always better to inadvertantly go from dark -> light vs light -> dark
  // if there has to be a theme flash.
  const theme = await z
    .enum(["light", "dark"])
    .parseAsync(prefs.get("theme"))
    .catch(() => "dark" as const);
  prefs.set("theme", theme);

  // Create the new preferences cookie.
  const cookie = await preferences.commitSession(prefs);

  return { theme, cookie };
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwind },
  { rel: "stylesheet", href: Inter },
  { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
  { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
  { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
  { rel: "manifest", href: "/site.webmanifest" },
  { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#5bbad5" },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export const meta: MetaFunction = () => [
  { title: "Spencer Duball" },
  { name: "msapplication-TileColor", content: "#2b5797" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { theme, cookie: prefsCookie } = await handlePreferencesCookie(request);
  console.log(prefsCookie);

  return json({ theme }, { headers: [["Set-Cookie", prefsCookie]] });
}

function App() {
  // Calculate the "theme" value. When SSR it will come from cookies (if exists), or else it will come from the
  // global context value.
  const { theme } = useLoaderData<typeof loader>();
  const [{ _theme }] = React.useContext(GlobalContext);
  const isHydrated = useHydrated();

  return (
    <html lang="en" className={isHydrated ? _theme : theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function AppWithContext() {
  return (
    <GlobalContextProvider>
      <App />
    </GlobalContextProvider>
  );
}
