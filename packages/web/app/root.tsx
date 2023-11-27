import React from "react";
import { cssBundleHref } from "@remix-run/css-bundle";
import { json } from "@remix-run/node";
import type { LinksFunction, MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import tailwind from "~/tailwind.css";
import Inter from "@fontsource-variable/inter/index.css";
import { preferences } from "~/lib/cookies";
import { GlobalCtxProvider, GlobalCtx } from "~/lib/context/global-ctx";
import { slate, slateDark } from "@radix-ui/colors";
import { Header } from "~/lib/app/header";
import { useHydrated } from "remix-utils/use-hydrated";
import { ToasterProvider } from "~/lib/context/toaster-ctx";
import { logRequest } from "~/lib/util/utilities.server";

/**
 * SSR-ONLY
 * Accepts the HTTP request object, extracts the '__preferences' cookie, reads or defaults the cookie's theme
 * attribute, and finally returns an object with the theme string and cookie to be set on HTTP response.
 *
 * @param request The HTTP request object.
 * @returns An object with the theme and new HTTP cookie value.
 */
async function handlePreferencesCookie(request: Request) {
  // Get the preferences cookie, if it doesn't exist it will be null.
  let prefs = await preferences.parse(request.headers.get("cookie"));

  // If the preferences cookie with valid 'theme' doesn't exist, default it to 'dark'.
  if (!prefs) prefs = { theme: "dark" };

  // Serialize the new preferences cookie.
  const cookie = await preferences.serialize(prefs);

  return { theme: prefs.theme, cookie };
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
  await logRequest(request);

  const { theme, cookie: prefsCookie } = await handlePreferencesCookie(request);

  return json({ theme }, { headers: [["Set-Cookie", prefsCookie]] });
}

function App() {
  // Calculate the "theme" value. When SSR it will come from cookies (if exists), or else it will come from the
  // global context value on client.
  const { theme } = useLoaderData<typeof loader>();
  const [{ preferences }] = React.useContext(GlobalCtx);
  const isHydrated = useHydrated();
  const calculatedTheme = isHydrated ? preferences._theme : theme;

  // The theme color needs to be computed in SW to a static value, not a CSS variable. If a CSS variable is
  // used, then the 'theme-color' Meta tag will not update responsively to theme changes on client side.
  const themeColor = calculatedTheme === "dark" ? slateDark.slate1 : slate.slate1;

  return (
    <html lang="en" className={calculatedTheme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content={themeColor} />
        <Meta />
        <Links />
      </head>
      <body className="bg-slate-1">
        <ToasterProvider>
          <Header isAdmin={true} />
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </ToasterProvider>
      </body>
    </html>
  );
}

export default function AppWithContext() {
  return (
    <GlobalCtxProvider>
      <App />
    </GlobalCtxProvider>
  );
}
