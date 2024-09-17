import { type LinksFunction, type LoaderFunctionArgs, type MetaFunction, unstable_data as data } from "@remix-run/node";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteLoaderData } from "@remix-run/react";
import React from "react";
import { Footer } from "~/components/footer";
import { Header } from "~/components/header";
import { Toaster } from "~/components/toaster";
import { GlobalCtx } from "~/context/global-ctx/context";
import { GlobalCtxProvider } from "~/context/global-ctx/provider";
import { flash, preferences, UserSession } from "~/util/server";

// import css files
import "@fontsource-variable/inter/index.css?url";
import tailwindcss from "./tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
  { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
  { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
  { rel: "manifest", href: "/site.webmanifest" },
  { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#5bbad5" },
  { rel: "stylesheet", href: tailwindcss },
];

export const meta: MetaFunction = () => [
  { title: "Spencer Duball" },
  { name: "msapplication-TileColor", content: "#2b5797" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const resHeaders: HeadersInit = [];

  const user = await UserSession.user(request.headers.get("cookie")).catch(() => null);

  // Handle Preferences Cookie
  // -----------------------------------------------------------------------------------
  // Retrieves and parses the theme from the __preferences cookie. If the cookie is
  // invalid or doesn't exist then respond with a a Set-Cookie to set the __preferences
  // cookie. The theme will be used in SSR of the app.
  let prefs = await preferences.parse(request.headers.get("cookie")).catch(() => null);
  if (!prefs) {
    prefs = { _theme: "dark", _codeTheme: "dark" };
    resHeaders.push(["Set-Cookie", await preferences.serialize(prefs)]);
  }

  // Handle Flash Cookie
  // -----------------------------------------------------------------------------------
  // Because we only set flash cookies in response to server actions other than GET, we
  // can be sure that the root loader will be invalidated (due to an action) and we will
  // be able to send the flash down in this loader.
  const flashCookie = await flash.parse(request.headers.get("cookie")).catch(() => null);
  if (flashCookie) {
    resHeaders.push(["Set-Cookie", await flash.serialize(null, { maxAge: 0 })]);
  }

  return data({ prefs, user: user ?? undefined, flash: flashCookie ?? undefined }, { headers: resHeaders });
}

function _Layout({ children }: { children: React.ReactNode }) {
  const [{ preferences }] = React.useContext(GlobalCtx);
  const data = useRouteLoaderData<typeof loader>("root");

  const isAdmin = data?.user?.roles.includes("admin") || false;

  return (
    <html lang="en" className={preferences._theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="grid min-h-[100dvh] grid-rows-[min-content_1fr_min-content] bg-slate-1 dark:bg-slatedark-1">
        <Header isAdmin={isAdmin} />
        <div className="justify-start">{children}</div>
        <Footer user={data?.user} />
        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");

  return (
    <GlobalCtxProvider _theme={data?.prefs?._theme || "dark"} _codeTheme={data?.prefs?._codeTheme || "dark"}>
      <_Layout children={children} />
    </GlobalCtxProvider>
  );
}

export default function App() {
  return <Outlet />;
}
