import React from "react";
import * as P from "@/components/ui/pagination";
import { Link, LinkOptions, RegisteredRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

// -------------------------------------------------------------------------------------
// PaginationLink
// -------------------------------------------------------------------------------------
type PaginationLinkProps<TTo extends LinkOptions["to"]> = React.ComponentProps<typeof Button> & {
  to: NonNullable<TTo>;
  params: LinkOptions<RegisteredRouter, string, TTo>["params"];
  isActive?: boolean;
};

function PaginationLink<TTo extends LinkOptions["to"]>({ to, params, isActive, ...props }: PaginationLinkProps<TTo>) {
  return (
    <Button
      variant={isActive ? "outline" : "ghost"}
      size="icon"
      render={<Link to={to} params={params} />}
      nativeButton={false}
      {...props}
    />
  );
}

// -------------------------------------------------------------------------------------
// Pagination
// -------------------------------------------------------------------------------------

interface IPaginationData {
  /** The current page number. */
  current: number;
  /** The size (number of items) per page. */
  size: number;
  /** The total items available. */
  total: number;
}

export type PaginationProps<TTo extends LinkOptions["to"]> = React.ComponentProps<"ol"> & {
  /**
   * The path the links will navigate to.
   */
  to: NonNullable<TTo>;
  /**
   * A function that takes the page index and creates a params object for navigation.
   */
  params: (idx: number) => LinkOptions<RegisteredRouter, string, TTo>["params"];
  /**
   * The pagination data used to compute the links displayed.
   */
  page: IPaginationData;
};

export function Pagination<TTo extends LinkOptions["to"]>({
  to,
  params,
  page,
  className,
  ...props
}: PaginationProps<TTo>) {
  const max = Math.ceil(page.total / page.size);

  // build the links for mobile
  const pgLink = (idx: number) => (
    <PaginationLink isActive={idx === page.current} to={to} params={params(idx)}>
      {idx}
    </PaginationLink>
  );
  let mobile: React.ReactElement[] = [];
  if (max < 5) {
    // if less than 5 items, add all to list (no ellipsis needed)
    for (let idx = 1; idx <= max; idx++) mobile.push(pgLink(idx));
  } else {
    if (page.current <= 3) {
      // display the first 3 links, ellipsis, and max
      [1, 2, 3].forEach((idx) => mobile.push(pgLink(idx)));
      mobile.push(<P.PaginationEllipsis />);
      mobile.push(pgLink(max));
    } else if (page.current > max - 3) {
      // display the first link, ellipsis, and the last 3 links
      mobile.push(pgLink(1));
      mobile.push(<P.PaginationEllipsis />);
      [-2, -1, 0].forEach((offset) => mobile.push(pgLink(max + offset)));
    } else {
      mobile.push(pgLink(1));
      mobile.push(<P.PaginationEllipsis />);
      [-1, 0, 1].forEach((offset) => mobile.push(pgLink(page.current + offset)));
      mobile.push(<P.PaginationEllipsis />);
      mobile.push(pgLink(max));
    }
  }

  // build the links for desktop
  let desktop: React.ReactElement[] = [];
  if (max <= 9) {
    // if less than 9 items, add all to list (no ellipsis needed)
    for (let idx = 1; idx <= max; idx++) desktop.push(pgLink(idx));
  } else {
    if (page.current <= 5) {
      [1, 2, 3, 4, 5].forEach((idx) => desktop.push(pgLink(idx)));
      desktop.push(<P.PaginationEllipsis />);
      [-1, 0].forEach((offset) => desktop.push(pgLink(max + offset)));
    } else if (page.current > max - 5) {
      [1, 2].forEach((idx) => desktop.push(pgLink(idx)));
      desktop.push(<P.PaginationEllipsis />);
      [-4, -3, -2, -1, -0].forEach((offset) => desktop.push(pgLink(max + offset)));
    } else {
      [1, 2].forEach((idx) => desktop.push(pgLink(idx)));
      desktop.push(<P.PaginationEllipsis />);
      [-2, -1, 0, 1, 2].forEach((offset) => desktop.push(pgLink(page.current + offset)));
      desktop.push(<P.PaginationEllipsis />);
      [-1, 0].forEach((offset) => desktop.push(pgLink(max + offset)));
    }
  }

  return (
    <>
      <ol className={cn("grid auto-cols-max grid-flow-col justify-center gap-1 md:hidden", className)} {...props}>
        <li>
          <Button
            variant="ghost"
            render={<Link to={to} params={params(page.current - 1)}></Link>}
            nativeButton={false}
            disabled={page.current === 1}
            className={cn(
              page.current === 1 && "text-muted-foreground hover:text-muted-foreground hover:bg-transparent",
            )}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} />
            Prev
          </Button>
        </li>
        {mobile.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
        <li>
          <Button
            variant="ghost"
            render={<Link to={to} params={params(page.current + 1)}></Link>}
            nativeButton={false}
            disabled={page.current === max}
            className={cn(
              page.current === max && "text-muted-foreground hover:text-muted-foreground hover:bg-transparent",
            )}
          >
            Next
            <HugeiconsIcon icon={ArrowRight01Icon} />
          </Button>
        </li>
      </ol>
      <ol className={cn("hidden auto-cols-max grid-flow-col justify-center gap-1 md:grid", className)} {...props}>
        <Button
          variant="ghost"
          render={<Link to={to} params={params(page.current - 1)}></Link>}
          nativeButton={false}
          disabled={page.current === 1}
          className={cn(page.current === 1 && "text-muted-foreground hover:text-muted-foreground hover:bg-transparent")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} />
          Prev
        </Button>
        {desktop.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
        <Button
          variant="ghost"
          render={<Link to={to} params={params(page.current + 1)}></Link>}
          nativeButton={false}
          disabled={page.current === max}
          className={cn(
            page.current === max && "text-muted-foreground hover:text-muted-foreground hover:bg-transparent",
          )}
        >
          Next
          <HugeiconsIcon icon={ArrowRight01Icon} />
        </Button>
      </ol>
    </>
  );
}
