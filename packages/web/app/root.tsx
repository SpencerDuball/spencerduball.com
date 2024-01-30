import React, { useEffect, useContext } from "react";
import { cssBundleHref } from "@remix-run/css-bundle";
import { json } from "@remix-run/node";
import type { LinksFunction, MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import tailwind from "~/tailwind.css";
import Inter from "@fontsource-variable/inter/index.css";
import { preferences } from "~/lib/util/cookies";
import { GlobalCtxProvider, GlobalCtx } from "~/lib/context/global-ctx";
import { slate, slateDark } from "@radix-ui/colors";
import { Header } from "~/lib/app/header";
import { useHydrated } from "remix-utils/use-hydrated";
import { ToasterProvider, Types } from "~/lib/context/toaster-ctx";
import { logger } from "~/lib/util/globals.server";
import { getSessionInfo } from "~/lib/util/utils.server";
import { ZPublicSession } from "~/lib/util/utils";
import { Footer } from "~/lib/app/footer";
import { flashCookie, _flashCookie } from "~/lib/util/sessions.server";
import { ToasterCtx } from "~/lib/context/toaster-ctx";

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
  logger(request);
  const resHeaders: HeadersInit = [];

  // Handle Cookie Theme
  // -------------------
  // Retrieves and parses the theme from the __preferences cookie. If the cookie is invalid or doesn't exist then
  // respond with a Set-Cookie to set the __preferences cookie. The theme will be used in SSR of the app.
  let prefs = await preferences.parse(request.headers.get("cookie")).catch(() => null);
  if (!prefs) {
    prefs = { theme: "dark", codeTheme: "dark" };
    resHeaders.push(["Set-Cookie", await preferences.serialize(prefs)]);
  }

  // Retrieve User Session
  // ---------------------
  // Retrieves the session information from the __session cookie. If the cookie exists, we will remove extra details
  // from the session by parsing only for the ZPublicSession. The session will be used in SSR of the app.
  const session = await getSessionInfo(request).then((s) => (s ? ZPublicSession.parse(s) : null));

  // Handle Flash Cookie
  // -------------------
  // If there was a flash cookie sent with this request we want to clear this cookie by sending a Set-Cookie header.
  // The flash will be used in SSR of the app.
  const flash = await flashCookie.parse(request.headers.get("cookie"));
  if (flash) resHeaders.push(["Set-Cookie", await _flashCookie.serialize("", { maxAge: 0 })]);

  return json({ prefs, session, flash }, { headers: resHeaders });
}

/**
 * This component will retrieve the flash message and display it as a toast.
 */
function DisplayFlash() {
  const { flash } = useLoaderData<typeof loader>();
  const [, dispatch] = useContext(ToasterCtx);

  useEffect(() => {
    if (flash) dispatch({ type: Types.AddToast, payload: flash });
  }, [flash]);

  return <></>;
}

function App() {
  const { session } = useLoaderData<typeof loader>();
  const [{ preferences }] = React.useContext(GlobalCtx);

  // The name="theme-color" meta tag must be supplied with an actual hex value, not a class.
  const metaThemeColor = preferences._theme === "dark" ? slateDark.slate1 : slate.slate1;

  return (
    <html lang="en" className={preferences._theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content={metaThemeColor} />
        <Meta />
        <Links />
      </head>
      <body className="grid min-h-[100dvh] grid-rows-[min-content_1fr_min-content] bg-slate-1">
        <ToasterProvider>
          <Header isAdmin={session?.roles.includes("admin") || false} />
          <div className="justify-start">
            <Outlet />
          </div>
          <Footer session={session} />
          <DisplayFlash />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </ToasterProvider>
      </body>
    </html>
  );
}

export default function AppWithContext() {
  const { prefs } = useLoaderData<typeof loader>();

  return (
    <GlobalCtxProvider _codeTheme={prefs.codeTheme} _theme={prefs.theme}>
      <App />
    </GlobalCtxProvider>
  );
}
