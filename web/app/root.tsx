// root.tsx
import React, { useContext, useEffect } from "react";
import { withEmotionCache } from "@emotion/react";
import { ChakraProvider, cookieStorageManagerSSR, localStorageManager } from "@chakra-ui/react";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { MetaFunction, LoaderArgs } from "@remix-run/node";
import { theme } from "@dub-stack/chakra-radix-colors";
import { Grid, Container, extendTheme } from "@chakra-ui/react";
import { Header } from "~/components";
import { ServerStyleContext, ClientStyleContext } from "./context";
import cookie from "cookie";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/800.css";

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

export async function loader({ request }: LoaderArgs) {
  const cookies = cookie.parse(request.headers.get("cookie") || "");
  const colorModeCookie =
    "chakra-ui-color-mode" in cookies ? cookie.serialize("chakra-ui-color-mode", cookies["chakra-ui-color-mode"]) : "";
  return json({ colorModeCookie: colorModeCookie });
}

export const ChakraGapHeight = 8;
export default function App() {
  const { colorModeCookie } = useLoaderData<typeof loader>();
  console.log(colorModeCookie);

  return (
    <Document>
      <ChakraProvider theme={customTheme} colorModeManager={cookieStorageManagerSSR(colorModeCookie)}>
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
