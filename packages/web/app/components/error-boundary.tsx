import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { Highlight } from "prism-react-renderer";
import { RiAlarmWarningLine } from "react-icons/ri";
import { ScrollArea, ScrollViewport } from "~/components/ui/scroll-area";
import { cn } from "~/util";

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      // For the height, we are subtracting `theme(spacing.40)` which is the height of the `Header` plus `Footer` component from total dvh.
      <main className="grid w-full justify-items-center">
        <div className="grid h-[calc(100dvh-theme(spacing.40))] w-full max-w-5xl place-items-center px-4 py-6 pb-[theme(spacing.40)]">
          <div className="grid justify-items-center gap-4">
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
        <div className="grid w-full max-w-5xl content-start gap-10 px-4 py-6">
          <div className="grid gap-4">
            <h1 className="text-5xl font-semibold">Oops! ...</h1>
            <p className="text-lg text-slate-11">Looks like an error from our end.</p>
          </div>
          <ScrollArea className="max-w-5xl rounded-lg bg-red-3 p-4">
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
