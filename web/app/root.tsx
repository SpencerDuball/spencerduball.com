// root.tsx
import React, { useContext, useEffect } from "react";
import { withEmotionCache } from "@emotion/react";
import { ChakraProvider, localStorageManager } from "@chakra-ui/react";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { theme } from "@dub-stack/chakra-radix-colors";
import { Grid, Container, extendTheme } from "@chakra-ui/react";
import { Header } from "~/components";
import "@fontsource/inter/index.css";
import { ServerStyleContext, ClientStyleContext } from "./context";
import cookie from "cookie";

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

interface LoaderData {
  env: { API_URL: string };
}

export const loader: LoaderFunction = async ({ request }) => {
  // set cookie if access token in search params
  const search = new URL(request.url).searchParams;
  if (search.has("token")) {
    const sessionCookieOptions = { secure: true, sameSite: "lax", maxAge: 604_800, httpOnly: true } as const;
    const sessionCookie = cookie.serialize("access_token", search.get("token")!, sessionCookieOptions);
    let headers: HeadersInit = { "Set-Cookie": sessionCookie };
    return redirect("/", { headers });
  }

  // collect the environment variables for the browser
  if (!process.env.API_URL) throw new Error("'API_URL' is not defined.");
  const env = { API_URL: process.env.API_URL };

  return json({ env });
};

export default function App() {
  const { env } = useLoaderData<LoaderData>();

  return (
    <Document>
      <ChakraProvider theme={customTheme} colorModeManager={localStorageManager}>
        <Grid gap={8}>
          <Header signInUrl={`${env.API_URL}/auth/github/authorize`} />
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
