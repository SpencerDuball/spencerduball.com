import { useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { RiAlarmWarningLine } from "react-icons/ri/index.js"; // TODO: Remove the 'index.js' after this issue: https://github.com/remix-run/remix/discussions/7451
import { ScrollArea, ScrollViewport } from "~/lib/ui/scroll-box";
import { cn } from "~/lib/util/utils";
import { Highlight } from "prism-react-renderer";

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      // For the height and bottom padding, we are using `theme(spacing.20)` as this is the height of the `Header` component.
      <main className="grid w-full justify-items-center">
        <div className="w-full max-w-5xl py-6 px-4 grid h-[calc(100dvh-theme(spacing.20))] place-items-center pb-[theme(spacing.20)]">
          <div className="grid gap-4 justify-items-center">
            <RiAlarmWarningLine className="h-32 w-32" />
            <h1 className="text-5xl font-semibold">
              {error.status} {error.statusText}
            </h1>
          </div>
        </div>
      </main>
    );
  } else if (error instanceof Error) {
    return (
      <main className="grid w-full justify-items-center">
        <div className="w-full max-w-5xl py-6 px-4 grid gap-10 content-start">
          <div className="grid gap-4">
            <h1 className="text-5xl font-semibold">Oops! ...</h1>
            <p className="text-lg text-slate-11">Looks like an error from our end.</p>
          </div>
          <ScrollArea className="bg-red-3 p-4 rounded-lg max-w-5xl">
            <ScrollViewport>
              <Highlight language="txt" code={error.stack || "No stack trace to display."}>
                {({ className, tokens, getLineProps, getTokenProps }) => (
                  <pre className={cn("text-sm leading-snug", className)}>
                    {tokens.map((line, i) => {
                      const isLastLine = i === tokens.length - 1;
                      const isLineEmpty = line[0].empty;
                      if (isLastLine && isLineEmpty) return null;
                      return (
                        <div key={i} {...getLineProps({ line, key: i })}>
                          {line.map((token, key) => (
                            <span
                              key={i}
                              {...getTokenProps({ token, key })}
                              className={cn(getTokenProps({ token, key }).className, "text-red-11")}
                            />
                          ))}
                        </div>
                      );
                    })}
                  </pre>
                )}
              </Highlight>
            </ScrollViewport>
          </ScrollArea>
        </div>
      </main>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
