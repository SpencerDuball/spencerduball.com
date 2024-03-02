import { Link, useLocation, type Location, LinkProps } from "@remix-run/react";
import { cn } from "~/lib/util/utils";
import { z } from "zod";
import { IconButtonProps, buttonVariants, iconButtonVariants } from "../button";
import { RiArrowRightSLine, RiArrowLeftSLine, RiMoreFill } from "react-icons/ri/index.js";

/**
 * This function will parse the location object for the "?page=" search parameter. If it is found the page number
 * will be parsed and returned. If an invalid page number is found it will return -1, if no page number is found it
 * will return null.
 *
 * A valid page number is a positive
 *
 * @param location The Location object.
 */
function getCurrentPage(location: Location) {
  const search = new URLSearchParams(location.search);
  if (search.has("page")) return z.coerce.number().positive().int().gte(1).catch(-1).parse(search.get("page"));
  else return null;
}

/**
 * This function takes the Location, extracts the search parameters,
 *
 * @param page The page number.
 * @param location The Location object.
 */
function pageToLink(page: number, location: Location) {
  const currSearch = new URLSearchParams(location.search);
  const nextSearch = new URLSearchParams();

  // add the "page" parameter first
  nextSearch.append("page", page.toString());

  // add the existing parameters
  currSearch.sort();
  for (let [k, v] of currSearch) {
    if (k !== "page") nextSearch.append(k, v);
  }

  return `${location.pathname}?${nextSearch.toString()}`;
}

//---------------------------------------------------------------------------------------------------------------------
// PaginationItem
// --------------
// The button for selecting a new page.
//---------------------------------------------------------------------------------------------------------------------
interface IPaginationProps extends LinkProps, Pick<IconButtonProps, "isActive"> {}

function PaginationItem({ isActive, className, ...props }: IPaginationProps) {
  return (
    <li>
      <Link
        aria-current={isActive ? "page" : undefined}
        className={cn(iconButtonVariants({ variant: isActive ? "outline" : "ghost", size: "md" }), className)}
        {...props}
      />
    </li>
  );
}

//---------------------------------------------------------------------------------------------------------------------
// More
// ----
// The ellipsis icon that indicates there is a span of pages between entries.
//---------------------------------------------------------------------------------------------------------------------
interface IMore extends React.ComponentProps<"div"> {}

function More({ className, ...props }: IMore) {
  return (
    <div className={cn("grid h-10 w-10 place-items-center", className)} {...props}>
      <RiMoreFill className="h-5 w-5 text-slate-9" />
    </div>
  );
}

//---------------------------------------------------------------------------------------------------------------------
// Pagination
// ----------
// The entire Pagination component.
//---------------------------------------------------------------------------------------------------------------------
export interface PaginationProps extends React.ComponentProps<"nav"> {
  total: number;
  pageSize: number;
}

export function Pagination({ total, pageSize, className, ...props }: PaginationProps) {
  const location = useLocation();

  const page = getCurrentPage(location) || 1;
  const maxPage = Math.ceil(total / pageSize);

  function pageItem(idx: number) {
    return (
      <PaginationItem to={pageToLink(idx, location)} isActive={page === idx}>
        {idx}
      </PaginationItem>
    );
  }

  // build the links for tablet devices
  let tabletItems: React.ReactElement[] = [];
  if (maxPage < 5) for (let idx of [...Array(maxPage).keys()].map((i) => i + 1)) tabletItems.push(pageItem(idx));
  else {
    if (page <= 3) {
      [1, 2, 3].forEach((idx) => tabletItems.push(pageItem(idx)));
      tabletItems.push(<More />);
      tabletItems.push(pageItem(maxPage));
    } else if (page > maxPage - 3) {
      tabletItems.push(pageItem(1));
      tabletItems.push(<More />);
      [2, 1, 0].forEach((idx) => tabletItems.push(pageItem(maxPage - idx)));
    } else {
      tabletItems.push(pageItem(1));
      tabletItems.push(<More />);
      tabletItems.push(pageItem(page));
      tabletItems.push(<More />);
      tabletItems.push(pageItem(maxPage));
    }
  }

  // build the links for desktop devices
  let desktopItems: React.ReactElement[] = [];
  if (maxPage <= 9) for (let idx of [...Array(maxPage).keys()].map((i) => i + 1)) desktopItems.push(pageItem(idx));
  else {
    if (page <= 5) {
      [1, 2, 3, 4, 5].forEach((idx) => desktopItems.push(pageItem(idx)));
      desktopItems.push(<More />);
      desktopItems.push(pageItem(maxPage - 1));
      desktopItems.push(pageItem(maxPage));
    } else if (page > maxPage - 5) {
      desktopItems.push(pageItem(1));
      desktopItems.push(pageItem(2));
      desktopItems.push(<More />);
      [4, 3, 2, 1, 0].forEach((idx) => desktopItems.push(pageItem(maxPage - idx)));
    } else {
      [1, 2].forEach((idx) => desktopItems.push(pageItem(idx)));
      desktopItems.push(<More />);
      [-2, -1, 0, 1, 2].forEach((idx) => desktopItems.push(pageItem(page + idx)));
      desktopItems.push(<More />);
      [1, 0].forEach((idx) => desktopItems.push(pageItem(maxPage - idx)));
    }
  }

  return (
    <nav role="navigation" aria-label="pagination" className={className} {...props}>
      <ul className="flex gap-1">
        {/* Prev Link */}
        <li>
          {page && page > 1 ? (
            <Link
              to={page && page > 1 ? pageToLink(page - 1, location) : "#"}
              aria-disabled={!(page && page > 1)}
              className={cn(
                "align-middle",
                buttonVariants({ variant: "ghost", size: "md", isDisabled: !(page && page > 1) }),
              )}
            >
              <RiArrowLeftSLine className="h-4 w-4" />
              <span>Prev</span>
            </Link>
          ) : (
            <p className={cn("align-middle", buttonVariants({ variant: "ghost", size: "md", isDisabled: true }))}>
              <RiArrowLeftSLine className="h-4 w-4" />
              <span>Prev</span>
            </p>
          )}
        </li>
        {/* Extra Links - Small Screen */}
        <span className="hidden gap-1 sm:flex md:hidden">{...tabletItems}</span>
        {/* Extra Links - Large Screen */}
        <span className="hidden gap-1 md:flex">{...desktopItems}</span>
        {/* Next Link */}
        <li>
          {page && page < maxPage ? (
            <Link
              to={page && page < maxPage ? pageToLink(page + 1, location) : "#"}
              aria-disabled={!(page && page < maxPage)}
              className={cn(
                "align-middle",
                buttonVariants({ variant: "ghost", size: "md", isDisabled: !(page && page < maxPage) }),
              )}
            >
              <span>Next</span>
              <RiArrowRightSLine className="h-4 w-4" />
            </Link>
          ) : (
            <p className={cn("align-middle", buttonVariants({ variant: "ghost", size: "md", isDisabled: true }))}>
              <span>Next</span>
              <RiArrowRightSLine className="h-4 w-4" />
            </p>
          )}
        </li>
      </ul>
    </nav>
  );
}
