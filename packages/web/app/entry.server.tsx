/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import { PassThrough } from "node:stream";

import type { AppLoadContext, EntryContext, HandleDataRequestFunction } from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { ZEnv } from "./util";
import { getLogger, UserSession, SessionError } from "./util/server";
// @ts-ignore
import ms from "ms";
import { i } from "node_modules/vite/dist/node/types.d-aGj9QkWt";

const ABORT_DELAY = 5_000;

// Dynamically import the mock server if it's enabled.
if (ZEnv.parse(process.env).MOCKS_ENABLED) {
  const { server } = await import("./mocks/node");
  server.listen({ onUnhandledRequest: "bypass" });
}

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  // This is ignored so we can keep it in the template for visibility.  Feel
  // free to delete this parameter in your app if you're not using it!
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadContext: AppLoadContext,
) {
  await refreshSession(request.headers, responseHeaders);

  return isbot(request.headers.get("user-agent") || "")
    ? handleBotRequest(request, responseStatusCode, responseHeaders, remixContext)
    : handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext);
}

function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} abortDelay={ABORT_DELAY} />,
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      },
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} abortDelay={ABORT_DELAY} />,
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      },
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

export const handleDataRequest: HandleDataRequestFunction = async (response, { request }) => {
  await refreshSession(request.headers, response.headers);
  return response;
};

/**
 * This function will destroy or refresh the user's session based upon the cookie info.
 *
 * This function will check if the "__session" cookie is being set in the response, and
 * if it is - do nothing. If the session is expired, it will destroy the session. If the
 * session is stale (older than 24h), it will refresh the session.
 */
async function refreshSession(requestHeaders: Request["headers"], responseHeaders: Response["headers"]) {
  const logger = getLogger();

  const reqSession = await UserSession.parse(requestHeaders.get("Cookie")).catch(async (e) => {
    if (e instanceof SessionError) {
      logger.info({ traceId: "b141bdf5" }, "Session was bad, destroying it.");
      responseHeaders.append("Set-Cookie", e.sessionCookie);
    }
  });

  if (reqSession) {
    const isSettingSession = await UserSession.parse(responseHeaders.get("Set-Cookie")).then((val) => val !== null);
    const isExpiredSession = new Date(reqSession.expires_at) < new Date();
    const shouldRefreshSession = new Date(reqSession.modified_at) < new Date(Date.now() - ms("1d"));

    if (!isSettingSession) {
      if (isExpiredSession) {
        logger.info({ traceId: "3427a0a8" }, "Session is expired, destroying it.");
        responseHeaders.append("Set-Cookie", await UserSession.destroy(reqSession.id));
      } else if (shouldRefreshSession) {
        logger.info({ traceId: "27f3452d" }, "Session is stale, refreshing it.");
        responseHeaders.append("Set-Cookie", await UserSession.refresh(reqSession.id));
      }
    }
  }
}
