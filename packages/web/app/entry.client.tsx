/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";

/**
 * Note: When using React@18.x.x, there is an issue with root hydration. To get around this issue we can force React to use the
 * React@17.x.x by replaceing `hydrateRoot` with `hydrate`. Keep this until tehre is a fix for the following issues:
 * - https://github.com/remix-run/remix/issues/2570
 * - https://github.com/remix-run/remix/issues/4175
 * - https://github.com/remix-run/remix/issues/5020
 * - https://github.com/remix-run/remix/issues/4822
 */
// import { hydrateRoot } from "react-dom/client";
// startTransition(() => {
//   hydrateRoot(
//     document,
//     <StrictMode>
//       <RemixBrowser />
//     </StrictMode>
//   );
// });

import { hydrate } from "react-dom";
startTransition(() => {
  hydrate(
    <StrictMode>
      <RemixBrowser />
    </StrictMode>,
    document
  );
});
