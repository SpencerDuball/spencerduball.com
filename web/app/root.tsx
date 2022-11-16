// root.tsx
import React, { useContext, useEffect } from "react";
import { withEmotionCache } from "@emotion/react";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import { json, LinksFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { MetaFunction, LoaderArgs } from "@remix-run/node";
import { theme } from "@dub-stack/chakra-radix-colors";
import { ChakraProvider, Grid, Container, extendTheme, useConst, cookieStorageManagerSSR } from "@chakra-ui/react";
import { Header } from "~/components";
import { ServerStyleContext, ClientStyleContext } from "./context";
import cookie from "cookie";
import Inter400Font from "@fontsource/inter/400.css";
import Inter700Font from "@fontsource/inter/700.css";
import Inter900Font from "@fontsource/inter/900.css";
import { getUser } from "./session.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: Inter400Font },
  { rel: "stylesheet", href: Inter700Font },
  { rel: "stylesheet", href: Inter900Font },
];

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Spencer Duball",
  viewport: "width=device-width,initial-scale=1",
});

interface DocumentProps {
  children: React.ReactNode;
}

const Document = withEmotionCache(({ children }: DocumentProps, emotionCache) => {
  const serverStyleData = useContext(ServerStyleContext);
  const clientStyleData = useContext(ClientStyleContext);

  // Only executed on client
  useEffect(() => {
    // re-link sheet container
    emotionCache.sheet.container = document.head;
    // re-inject tags
    const tags = emotionCache.sheet.tags;
    emotionCache.sheet.flush();
    tags.forEach((tag) => {
      (emotionCache.sheet as any)._insertTag(tag);
    });
    // reset cache to reapply global styles
    clientStyleData?.reset();
  }, []);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        {serverStyleData?.map(({ key, ids, css }) => (
          <style key={key} data-emotion={`${key} ${ids.join(" ")}`} dangerouslySetInnerHTML={{ __html: css }} />
        ))}
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
});

const customTheme = extendTheme({
  ...theme,
  config: {
    initialColorMode: "dark",
  },
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
  },
});

const ColorModeCookieKey = "chakra-ui-color-mode";

export async function loader({ request }: LoaderArgs) {
  // get the colorModeCookie
  const cookies = cookie.parse(request.headers.get("cookie") || "");
  const colorModeCookie =
    ColorModeCookieKey in cookies ? cookie.serialize(ColorModeCookieKey, cookies[ColorModeCookieKey]) : "";

  // determine if user is admin
  const user = await getUser(request);
  const isAdmin = user?.roles?.includes("admin");

  return json({ isAdmin, colorModeCookie: colorModeCookie });
}

export const ChakraGapHeight = 8;
export default function App() {
  const { colorModeCookie } = useLoaderData<typeof loader>();
  const cookieManager = useConst(cookieStorageManagerSSR(colorModeCookie));

  return (
    <Document>
      <ChakraProvider theme={customTheme} colorModeManager={cookieManager}>
        <Grid gap={8} minH="100vh" gridTemplateRows="max-content 1fr">
          <Header />
          <Container as="main" maxW="container.lg">
            <Outlet />
          </Container>
        </Grid>
      </ChakraProvider>
    </Document>
  );
}
