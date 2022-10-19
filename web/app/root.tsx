// root.tsx
import React, { useContext, useEffect } from "react";
import { withEmotionCache } from "@emotion/react";
import { ChakraProvider, localStorageManager } from "@chakra-ui/react";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { theme } from "@dub-stack/chakra-radix-colors";
import { Grid, Container, extendTheme } from "@chakra-ui/react";
import { Header } from "~/components";
import { ServerStyleContext, ClientStyleContext } from "./context";
import "@fontsource/inter/index.css";
import { getSandpackCssText } from "@codesandbox/sandpack-react";

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

export const loader: LoaderFunction = async ({ request }) => {
  return null;
};

export default function App() {
  return (
    <Document>
      <ChakraProvider theme={customTheme} colorModeManager={localStorageManager}>
        <Grid gap={8}>
          <Header />
          <Grid as="main">
            <Container maxW="container.lg">
              <Outlet />
            </Container>
          </Grid>
        </Grid>
      </ChakraProvider>
    </Document>
  );
}
