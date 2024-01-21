import type { MDXComponents } from "mdx/types";
import { cn } from "~/lib/util/utils";
import { Link } from "@remix-run/react";
import { RiExternalLinkLine } from "react-icons/ri/index.js"; // TODO: Remove the 'index.js' after this issue: https://github.com/remix-run/remix/discussions/7451

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
      {children} <RiExternalLinkLine />
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

function Pre({ className, ...props }: React.ComponentPropsWithoutRef<"pre">) {
  // TODO: Add the pre component.
  return <pre className={cn("", className)} {...props} />;
}

function Table({ className, ...props }: React.ComponentPropsWithoutRef<"table">) {
  // TODO: Add the table component from shadcn/ui
  return <table className={cn("", className)} {...props} />;
}

function Tbody({ className, ...props }: React.ComponentPropsWithoutRef<"tbody">) {
  // TODO: Add the tbody component from shadcn/ui
  return <tbody className={cn("", className)} {...props} />;
}

function Td({ className, ...props }: React.ComponentPropsWithoutRef<"td">) {
  // TODO: Add the td component from shadcn/ui
  return <td className={cn("", className)} {...props} />;
}

function Th({ className, ...props }: React.ComponentPropsWithoutRef<"th">) {
  // TODO: Add the th component from shadcn/ui
  return <th className={cn("", className)} {...props} />;
}

function Thead({ className, ...props }: React.ComponentPropsWithoutRef<"thead">) {
  // TODO: Add the thead component from shadcn/ui
  return <thead className={cn("", className)} {...props} />;
}

function Tr({ className, ...props }: React.ComponentPropsWithoutRef<"tr">) {
  // TODO: Add the tr component from shadcn/ui
  return <tr className={cn("", className)} {...props} />;
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
