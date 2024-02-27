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
import { session, sessionCookie, SESSION_KEY } from "~/lib/util/sessions.server";
import { ZSession } from "@spencerduballcom/db/ddb";
import { getLogger } from "~/lib/util/globals.server";
import { parseCookie } from "~/lib/util/utils.server";
// @ts-ignore
import ms from "ms"; // TODO: This package has types that aren't defined correctly when using "Bundler" module resolution strategy.

const ABORT_DELAY = 5_000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext,
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
  // TODO: In addition to the `fixEmptyResponseHeaders` maybe also check for statusText and add
  // an appropriate message too? This would solve the 404 issues. Or can just have custom logic in
  // the `$.tsx` for 404 specifically?
  fixEmptyResponseHeaders(response);
  await refreshSession(request.headers, response.headers);
  return response;
};

/**
 * This function will update the 'Content-Type' header to 'text/plain' if the 'Content-Length' is 0. This fixes a bug
 * noticed only when deployed to CloudFront where responses with an empty body (null/undefined) seem to have a default
 * 'Content-Type: application/json'. Remix then tries to parse the body for JSON and a client-side error is thrown.
 *
 * TODO: Tracked by this GH issue: https://github.com/remix-run/react-router/issues/11145
 */
function fixEmptyResponseHeaders(res: Response) {
  if (!res.body) res.headers.set("Content-Type", "text/plain");
}

/**
 * This function will take in the request headers and response headers then compare the current time to the modified_at
 * time of the user's session. If the session has not been updated in more than 24 hours, we will update it to extend
 * the TTL. This allows a user to maintain a token for an unlimited period and not need to log back in such that they
 * continue to visit the site within 90d time windows.
 */
async function refreshSession(reqHeaders: Request["headers"], resHeaders: Response["headers"]) {
  const log = getLogger();

  const hasSession = await sessionCookie.parse(reqHeaders.get("cookie")).then((s) => !!s);
  const isSettingSession = !!parseCookie(SESSION_KEY, resHeaders.get("Set-Cookie") || "");

  if (hasSession && !isSettingSession) {
    // retrieve the session data
    const sesh = await session
      .getSession(reqHeaders.get("cookie"))
      .then(async ({ data }) => ZSession.parseAsync(data))
      .catch(async (e) => {
        log.warn(e, "Error: Session was malformed, deleting the session cookie.");
        resHeaders.append("Set-Cookie", await sessionCookie.serialize(""));
      });

    // if session older than 24h update it
    if (sesh) {
      const msSinceRefresh = new Date().getTime() - new Date(sesh.modified).getTime();
      if (msSinceRefresh > ms("24h")) {
        const sessionCookie = await session.commitSession(createSession(undefined, sesh.id));
        resHeaders.append("Set-Cookie", sessionCookie);
      }
    }
  }
}
