// root.tsx
import React, { useContext, useEffect } from "react";
import { withEmotionCache } from "@emotion/react";
import { ChakraProvider, cookieStorageManagerSSR, localStorageManager, useColorMode } from "@chakra-ui/react";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import type { MetaFunction, LoaderFunction } from "@remix-run/node"; // Depends on the runtime you choose
import { theme } from "@dub-stack/chakra-radix-colors";
import { Grid, Container, extendTheme } from "@chakra-ui/react";
import { Header } from "~/components";
import "@fontsource/inter/index.css";

import { ServerStyleContext, ClientStyleContext } from "./context";

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
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
  },
});

export const loader: LoaderFunction = async ({ request }) => {
  console.log("SERVER: ", request.headers.get("cookie"));
  const cookie = request.headers.get("cookie");
  if (cookie) return cookie;
  else return "";
};

const Yo = () => {
  const { colorMode } = useColorMode();
  const fetcher = useFetcher();

  useEffect(() => {
    console.log(document.cookie);
  }, [colorMode]);

  // print out the client info
  console.log(`Client_Side: colorMode=${colorMode}`);
  if (typeof window !== "undefined") console.log(`Client_Side: cookie=${document.cookie}`);
  console.log("\n");

  return null;
};

export default function App() {
  const cookies = useLoaderData();
  console.log(`Server_Side: cookie=${cookies}`);

  return (
    <Document>
      <ChakraProvider
        theme={customTheme}
        colorModeManager={typeof cookies === "string" ? cookieStorageManagerSSR(cookies) : localStorageManager}
      >
        <Grid gap={8}>
          <Yo />
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
