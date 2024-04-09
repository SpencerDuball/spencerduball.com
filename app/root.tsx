import * as React from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import { json, type LoaderFunctionArgs, type LinksFunction, type MetaFunction } from "@remix-run/node";
import { GlobalCtx, GlobalCtxProvider } from "~/context/global-ctx/context";
import { preferences } from "~/util/cookies";

// import css files
import tailwind from "~/tailwind.css?url";
import inter from "@fontsource-variable/inter/index.css?url";

export const links: LinksFunction = () => [
  { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
  { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
  { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
  { rel: "manifest", href: "/site.webmanifest" },
  { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#5bbad5" },
  { rel: "stylesheet", href: inter },
  { rel: "stylesheet", href: tailwind },
];

export const meta: MetaFunction = () => [
  { title: "Spencer Duball" },
  { name: "msapplication-TileColor", content: "#2b5797" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const resHeaders: HeadersInit = [];

  // Handle Preferences Cookie
  // -------------------------
  // Retrieves and parses the theme from the __preferences cookie. If the cookie is invalid or doesn't exist then
  // respond with a a Set-Cookie to set the __preferences cookie. The theme will be used in SSR of the app.
  let prefs = await preferences.parse(request.headers.get("cookie")).catch(() => null);
  if (!prefs) {
    prefs = { _theme: "dark", _codeTheme: "dark" };
    resHeaders.push(["Set-Cookie", await preferences.serialize(prefs)]);
  }

  return json({ prefs }, { headers: resHeaders });
}

function _Layout({ children }: { children: React.ReactNode }) {
  const [{ preferences }] = React.useContext(GlobalCtx);

  // The name="theme-color" meta tag must be supplied with an actual hex value, not a class.
  // const metaThemeColor = preferences._theme === "dark" ? slateDark.slate1 : slate.slate1;

  return (
    <html lang="en" className={preferences._theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-slate-1 dark:bg-slatedark-1">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { prefs } = useLoaderData<typeof loader>();

  return (
    <GlobalCtxProvider _theme={prefs._theme} _codeTheme={prefs._codeTheme}>
      <_Layout children={children} />
    </GlobalCtxProvider>
  );
}

export default function App() {
  return <Outlet />;
}
