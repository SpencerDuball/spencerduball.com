import { useSyncExternalStore, useCallback } from "react";

/**
 * Tracks the state of a CSS media query.
 *
 * @example
 * ```ts
 * const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
 * ```
 *
 * @param query The media query.
 * @param defaultSSR The default response when SSR.
 * @returns
 */
export function useMediaQuery(query: string, defaultSSR?: boolean): boolean {
  // memoize subscribe to prevent re-subscribing on every render
  const subscribe = useCallback(
    (callback: () => void) => {
      const matchMedia = window.matchMedia(query);
      matchMedia.addEventListener("change", callback);
      return () => matchMedia.removeEventListener("change", callback);
    },
    [query],
  );

  const getSnapshot = () => window.matchMedia(query).matches;

  // returning 'false' (or a default) for SSR to avoid hydration mismatches
  const getServerSnapshot = () => defaultSSR || false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
