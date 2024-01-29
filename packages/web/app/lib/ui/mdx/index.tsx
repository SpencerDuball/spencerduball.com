import * as React from "react";
import type { MDXComponents } from "mdx/types";
import { cn } from "~/lib/util/utils";
import { Link } from "@remix-run/react";
import { RiCheckLine, RiClipboardLine, RiExternalLinkLine, RiMoonLine, RiSunLine } from "react-icons/ri/index.js"; // TODO: Remove the 'index.js' after this issue: https://github.com/remix-run/remix/discussions/7451
import { z } from "zod";
import { GlobalCtx, Types } from "~/lib/context/global-ctx";
import { RxHalf2 } from "react-icons/rx/index.js"; // TODO: Remove the 'index.js' after this issue: https://github.com/remix-run/remix/discussions/7451
import { ScrollArea, ScrollViewport } from "../scroll-box";
import { Highlight, themes } from "prism-react-renderer";
import { Button, IconButton } from "~/lib/ui/button";

function A({ className, href, children, ...props }: React.ComponentPropsWithoutRef<"a">) {
  if (href && /^\//.test(href)) {
    return (
      <Link
        to={href}
        className={cn("focus-outline text-slate-10 hover:text-slate-12 hover:no-underline", className)}
        {...props}
      >
        {children}
      </Link>
    );
  } else {
    <a
      className={cn("focus-outline grid items-center text-slate-10 hover:text-slate-12 hover:no-underline", className)}
      href={href}
      {...props}
    >
      {children} <RiExternalLinkLine className="inline text-current" />
    </a>;
  }
}

function Blockquote({ className, ...props }: React.ComponentPropsWithoutRef<"blockquote">) {
  return (
    <blockquote
      className={cn("my-6 border-l-4 border-slate-5 bg-slate-2 px-5 py-4 [&>p]:mt-0", className)}
      {...props}
    />
  );
}

function Code({ className, ...props }: React.ComponentPropsWithoutRef<"code">) {
  return (
    <code className={cn("rounded-sm bg-slate-3 px-1 py-0.5 leading-normal text-slate-11", className)} {...props} />
  );
}

function H1({ className, ...props }: React.ComponentPropsWithoutRef<"h1">) {
  return <h1 className={cn("mb-1 mt-16 text-3xl font-bold leading-tight tracking-tight", className)} {...props} />;
}

function H2({ className, ...props }: React.ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      className={cn("mb-2 mt-14 text-2xl font-semibold leading-tight tracking-tight [&+h3]:mt-6", className)}
      {...props}
    />
  );
}

function H3({ className, ...props }: React.ComponentPropsWithoutRef<"h3">) {
  return <h3 className={cn("ht-12 text-xl font-semibold leading-tight tracking-tight", className)} {...props} />;
}

function H4({ className, ...props }: React.ComponentPropsWithoutRef<"h4">) {
  return <h4 className={cn("mt-12 text-lg font-semibold leading-snug", className)} {...props} />;
}

function Hr({ className, ...props }: React.ComponentPropsWithoutRef<"hr">) {
  return <hr className={cn("my-16", className)} {...props} />;
}

function Img({ className, ...props }: React.ComponentPropsWithoutRef<"img">) {
  return <img className={cn("mt-6 rounded-md border border-slate-6 object-cover", className)} {...props} />;
}

function Ol({ className, ...props }: React.ComponentPropsWithoutRef<"ol">) {
  return <ol className={cn("ml-5 mt-2 list-decimal [&_li]:mt-1", className)} {...props} />;
}

function P({ className, ...props }: React.ComponentPropsWithoutRef<"p">) {
  return <p className={cn("mt-4 text-base leading-6", className)} {...props} />;
}

function Pre({ children, className, ...props }: React.ComponentPropsWithoutRef<"pre">) {
  // validate the child matches expected input, this should always be true
  const child = React.Children.only(children);
  if (!(React.isValidElement(child) && "className" in child.props && "children" in child.props))
    throw new Error("Child of a fence does not match expected input.");
  const [classes, code]: [string | undefined, string] = [child.props.className, child.props.children];

  // extract the language
  const language = (classes?.match(/language-\w+/)?.[0] ?? "language-txt").replace(/^(language-)/, "");

  // get optional filename
  let filename: string | null = null;
  if ("filename" in props)
    filename = z
      .string()
      .nullable()
      .catch(() => null)
      .parse(props.filename);

  // setup hook to monitor for copy clicks
  const [copy, setCopy] = React.useState({ copied: false, timeoutId: -1 });
  async function onCopy() {
    if (copy.timeoutId > 0) window.clearTimeout(copy.timeoutId);
    await navigator.clipboard.writeText(code);
    const timeoutId = window.setTimeout(() => setCopy({ ...copy, copied: false }), 2000);
    setCopy({ copied: true, timeoutId });
  }

  // setup tracking and functionality for expanding and collapsing code
  const codeRef = React.useRef<HTMLDivElement>(null!);
  const [doesCodeExceedHeight, setDoesCodeExceedHeight] = React.useState(false);
  React.useEffect(() => {
    if (codeRef?.current?.clientHeight > 500) setDoesCodeExceedHeight(true);
    else if (doesCodeExceedHeight !== false) setDoesCodeExceedHeight(false);
  }, []);
  const [isExpanded, setIsExpanded] = React.useState(false);

  // determine theme icon
  const [{ preferences }, dispatch] = React.useContext(GlobalCtx);
  let themeIcon = <RxHalf2 />;
  if (preferences.codeTheme === "dark") themeIcon = <RiMoonLine />;
  else if (preferences.codeTheme === "light") themeIcon = <RiSunLine />;

  return (
    <pre
      className={cn(
        "relative mt-6 grid h-max overflow-hidden rounded-lg [&_.token]:font-mono",
        preferences._codeTheme === "dark" ? "bg-_slateDark-3" : "bg-_slate-3",
        className,
      )}
      {...props}
    >
      {filename && (
        <div
          className={cn(
            "border-b p-3 font-mono text-sm",
            preferences._codeTheme === "dark"
              ? "text-_slateDark-12 border-b-_slateDark-5"
              : "text-_slate-12 border-b-_slate-5",
          )}
        >
          {filename}
        </div>
      )}

      <ScrollArea>
        <ScrollViewport className={cn(!isExpanded && "max-h-[500px]", doesCodeExceedHeight && "pb-10")}>
          <div ref={codeRef} className="p-3">
            <Highlight
              code={code}
              language={language}
              theme={preferences._codeTheme === "dark" ? themes.vsDark : themes.vsLight}
            >
              {({ className, tokens, getLineProps, getTokenProps }) => (
                <pre className={cn("text-xs leading-snug", className)}>
                  {tokens.map((line, i) => {
                    const isLastLine = i === tokens.length - 1;
                    const isLineEmpty = line[0].empty;
                    if (isLastLine && isLineEmpty) return null;
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
          {doesCodeExceedHeight && (
            <Button
              variant="ghost"
              className={cn(
                "absolute bottom-0 left-0 right-0 rounded-none",
                preferences._codeTheme === "dark"
                  ? "text-_slateDark-9 hover:text-_slateDark-11 hover:bg-_slateDark-3 active:bg-_slateDark-4"
                  : "text-_slate-9 hover:text-_slate-11 hover:bg-_slate-3 active:bg-_slate-4",
              )}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          )}
        </ScrollViewport>
      </ScrollArea>
      <div className="absolute right-1.5 top-1.5 grid grid-flow-col gap-1">
        <IconButton
          variant="ghost"
          size="sm"
          className={cn(
            preferences._codeTheme === "dark"
              ? "text-_slateDark-9 hover:text-_slateDark-11 hover:bg-_slateDark-3 active:bg-_slateDark-4"
              : "text-_slate-9 hover:text-_slate-11 hover:bg-_slate-3 active:bg-_slate-4",
          )}
          aria-label="Toggle code theme."
          onClick={() => dispatch({ type: Types.ToggleCodeTheme })}
          icon={themeIcon}
        />
        <IconButton
          variant="ghost"
          size="sm"
          className={cn(
            preferences._codeTheme === "dark"
              ? "text-_slateDark-9 hover:text-_slateDark-11 hover:bg-_slateDark-3 active:bg-_slateDark-4"
              : "text-_slate-9 hover:text-_slate-11 hover:bg-_slate-3 active:bg-_slate-4",
          )}
          aria-label="Copy to clipboard."
          onClick={onCopy}
          icon={
            copy.copied ? <RiCheckLine className="h-4 w-4 text-green-9" /> : <RiClipboardLine className="h-4 w-4" />
          }
        />
      </div>
    </pre>
  );
}

function Table({ className, ...props }: React.ComponentPropsWithoutRef<"table">) {
  return <table className={cn("relative w-full overflow-auto", className)} {...props} />;
}

function Tbody({ className, ...props }: React.ComponentPropsWithoutRef<"tbody">) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

function Td({ className, ...props }: React.ComponentPropsWithoutRef<"td">) {
  return <td className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />;
}

function Th({ className, ...props }: React.ComponentPropsWithoutRef<"th">) {
  return (
    <th
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-slate-9 [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  );
}

function Thead({ className, ...props }: React.ComponentPropsWithoutRef<"thead">) {
  return <thead className={cn("[&_tr]:border-b", className)} {...props} />;
}

function Tr({ className, ...props }: React.ComponentPropsWithoutRef<"tr">) {
  return <tr className={cn("border-b hover:bg-slate-2 data-[state=selected]:bg-slate-3", className)} {...props} />;
}

function Ul({ className, ...props }: React.ComponentPropsWithoutRef<"ul">) {
  return <ul className={cn("ml-5 mt-2 list-disc [&_li]:mt-1", className)} {...props} />;
}

export const components: MDXComponents = {
  a: A,
  blockquote: Blockquote,
  code: Code,
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  hr: Hr,
  img: Img,
  ol: Ol,
  p: P,
  pre: Pre,
  table: Table,
  tbody: Tbody,
  td: Td,
  th: Th,
  thead: Thead,
  tr: Tr,
  ul: Ul,
};
