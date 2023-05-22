import type { Schema } from "@markdoc/markdoc";
import { Highlight, themes } from "prism-react-renderer";
import { ScrollArea, ScrollViewport } from "~/components/ui/scroll-box";
import React from "react";
import { GlobalContext } from "~/components/app/global-ctx";
import { cn } from "~/lib/util";
import * as Popover from "@radix-ui/react-popover";
import { IconButton } from "~/components/ui/button";
import { RiFileCopyLine } from "react-icons/ri";

export const fence: Schema = {
  render: "Fence",
  attributes: {
    content: { type: String, render: "content", required: true },
    language: { type: String, render: "language" },
  },
};

export interface FenceProps {
  content: string;
  language?: string;
}
export function Fence({ content, language }: FenceProps) {
  const [globalCtx] = React.useContext(GlobalContext);
  const [popover, setPopover] = React.useState(false);

  return (
    <pre className="relative mt-6 rounded-lg bg-slate-3 overflow-hidden grid">
      <ScrollArea>
        <ScrollViewport>
          <div className="p-3">
            <Highlight
              code={content}
              language={language || "txt"}
              theme={globalCtx._theme === "dark" ? themes.nightOwl : themes.nightOwlLight}
            >
              {({ className, tokens, getLineProps, getTokenProps }) => (
                <pre className={cn(className, "text-xs leading-snug")}>
                  {tokens.map((line, i) => {
                    const isLastLine = i === tokens.length - 1;
                    const isLineEmpty = line[0].empty;
                    if (isLastLine && isLineEmpty) return null;
                    else
                      return (
                        <div key={i} {...getLineProps({ line, key: i })}>
                          {line.map((token, key) => (
                            <span key={i} {...getTokenProps({ token, key })} />
                          ))}
                        </div>
                      );
                  })}
                </pre>
              )}
            </Highlight>
          </div>
        </ScrollViewport>
      </ScrollArea>
      <Popover.Root open={popover} onOpenChange={(open) => (open ? setTimeout(() => setPopover(false), 1000) : null)}>
        <Popover.Trigger
          asChild
          onClick={async () => await navigator.clipboard.writeText(content).then(() => setPopover(!popover))}
        >
          <IconButton
            aria-label="copy"
            size="xs"
            variant="ghost"
            icon={<RiFileCopyLine />}
            className={cn(
              globalCtx._theme === "light"
                ? "backdrop-blur-lg hover:bg-blackA-4 active:bg-blackA-5"
                : "backdrop-blur-lg hover:bg-whiteA-4 active:bg-whiteA-5",
              "absolute top-2 right-3 row-start-1"
            )}
          />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="end"
            className="rounded-lg p-2 bg-slate-2 border border-slate-6 border-radius-6 shadow mt-1"
          >
            <p className="text-xs text-slate-11">Copied to Cliboard</p>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </pre>
  );
}
