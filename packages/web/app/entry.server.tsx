/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import { PassThrough } from "node:stream";

import type { AppLoadContext, EntryContext, HandleDataRequestFunction } from "@remix-run/node";
import { createReadableStreamFromReadable, createSession } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import isbot from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { commitSession, getSession, sessionCookie } from "~/lib/session.server";
import { ZSession } from "@spencerduballcom/db/ddb";
import { getLogger } from "~/lib/util/globals.server";
// TODO: The @ts-ignore can be removed after the ms@3 is released. This is caused because of this bug:
// https://github.com/vercel/ms/pull/191
// @ts-ignore
import ms from "ms";

const ABORT_DELAY = 5_000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext
) {
  await refreshSession(request.headers, responseHeaders);

  return isbot(request.headers.get("user-agent"))
    ? handleBotRequest(request, responseStatusCode, responseHeaders, remixContext)
    : handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext);
}

function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
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
            })
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
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
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
            })
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
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

export const handleDataRequest: HandleDataRequestFunction = async (response, { request }) => {
  await refreshSession(request.headers, response.headers);
  return response;
};

/**
 * This function will take in the request headers and response headers then compare the current time to the modified_at
 * time of the user's session. If the session has not been updated in more than 24 hours, we will update it to extend
 * the TTL. This allows a user to maintain a token for an unlimited period and not need to log back in such that they
 * continue to visit the site within 90d time windows.
 */
async function refreshSession(reqHeaders: Request["headers"], resHeaders: Response["headers"]) {
  const log = getLogger();

  const hasSession = await sessionCookie.parse(reqHeaders.get("cookie")).then((s) => !!s);
  const isSettingSession = await sessionCookie.parse(resHeaders.get("set-cookie")).then((s) => !!s);

  if (hasSession && !isSettingSession) {
    // retrieve the session data
    const session = await getSession(reqHeaders.get("cookie"))
      .then(async ({ data }) => ZSession.parseAsync(data))
      .catch(async (e) => {
        log.warn(e, "Error: Session was malformed, deleting the session cookie.");
        resHeaders.append("Set-Cookie", await sessionCookie.serialize(""));
      });

    // if session older than 24h update it
    if (session) {
      const msSinceRefresh = new Date().getTime() - new Date(session.modified).getTime();
      if (msSinceRefresh > ms("24h")) {
        const sessionCookie = await commitSession(createSession(undefined, session.id));
        resHeaders.append("Set-Cookie", sessionCookie);
      }
    }
  }
}
