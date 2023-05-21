import * as React from "react";
import { cn } from "~/lib/util";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import { Link, LinkProps } from "@remix-run/react";

// PageSelectorLink
/////////////////////////////////////////////////////////////////////////////////////////////////////////
interface PageSelectorLinkProps extends React.ComponentProps<"a">, LinkProps {
  leftIcon?: React.ReactElement;
  rightIcon?: React.ReactElement;
  isDisabled?: boolean;
  isActive?: boolean;
}
const PageSelectorLink = ({
  leftIcon,
  rightIcon,
  isDisabled,
  isActive,
  children,
  className,
  ...props
}: Omit<PageSelectorLinkProps, "ref">) => {
  const allProps = {
    className: cn(
      "flex items-center text-blue-11 gap-1 px-1 focus-outline",
      isDisabled ? "text-slate-10 cursor-not-allowed" : "",
      isActive ? "text-slate-12" : "",
      { className }
    ),
    ...props,
  };

  return isDisabled ? (
    <span {...allProps}>
      {leftIcon}
      {children}
      {rightIcon}
    </span>
  ) : (
    <Link {...allProps}>
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  );
};

// Spacer
/////////////////////////////////////////////////////////////////////////////////////////////////////////
interface SpacerProps extends React.ComponentProps<"div"> {}
const Spacer = ({ className, ...props }: SpacerProps) => (
  <div className={cn("cursor-default px-2 text-slate-10", { className })} {...props}>
    ...
  </div>
);

// Pagination
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export interface PaginationProps extends React.ComponentProps<"div"> {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  hrefFn: (page: number) => string;
}
export const Pagination = ({ totalItems, itemsPerPage, currentPage, hrefFn, className, ...props }: PaginationProps) => {
  // determine the number of pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // define page num btn
  const PgNumBtn = ({ pgNum, className, ...props }: Omit<PageSelectorLinkProps, "to"> & { pgNum: number }) => (
    <PageSelectorLink
      to={hrefFn(pgNum)}
      isActive={currentPage === pgNum}
      className={cn("text-slate-11", { className })}
      {...props}
    >
      {pgNum}
    </PageSelectorLink>
  );

  // build the list for tablet devices
  let tabletBtns: React.ReactElement[] = [];
  if (totalPages <= 5) {
    Array.from({ length: totalPages }, (_, i) => i + 1).forEach((pgNum) => tabletBtns.push(<PgNumBtn pgNum={pgNum} />));
  } else {
    if (currentPage <= 3) {
      [1, 2, 3].forEach((pgNum) => tabletBtns.push(<PgNumBtn pgNum={pgNum} />));
      tabletBtns.push(<Spacer />);
      tabletBtns.push(<PgNumBtn pgNum={totalPages} />);
    } else if (currentPage > totalPages - 3) {
      tabletBtns.push(<PgNumBtn pgNum={1} />);
      tabletBtns.push(<Spacer />);
      [totalPages - 2, totalPages - 1, totalPages].forEach((pgNum) => tabletBtns.push(<PgNumBtn pgNum={pgNum} />));
    } else {
      tabletBtns.push(<PgNumBtn pgNum={1} />);
      tabletBtns.push(<Spacer />);
      tabletBtns.push(<PgNumBtn pgNum={currentPage} />);
      tabletBtns.push(<Spacer />);
      tabletBtns.push(<PgNumBtn pgNum={totalPages} />);
    }
  }

  // build the list for desktop devices
  let desktopBtns: React.ReactElement[] = [];
  if (totalPages <= 9) {
    Array.from({ length: totalPages }, (_, i) => i + 1).forEach((pgNum) =>
      desktopBtns.push(<PgNumBtn pgNum={pgNum} />)
    );
  } else {
    if (currentPage <= 5) {
      [1, 2, 3, 4, 5].forEach((pgNum) => desktopBtns.push(<PgNumBtn pgNum={pgNum} />));
      desktopBtns.push(<Spacer />);
      desktopBtns.push(<PgNumBtn pgNum={totalPages - 1} />);
      desktopBtns.push(<PgNumBtn pgNum={totalPages} />);
    } else if (currentPage > totalPages - 5) {
      desktopBtns.push(<PgNumBtn pgNum={1} />);
      desktopBtns.push(<PgNumBtn pgNum={2} />);
      desktopBtns.push(<Spacer />);
      [4, 3, 2, 1, 0]
        .map((offset) => totalPages - offset)
        .forEach((pgNum) => desktopBtns.push(<PgNumBtn pgNum={pgNum} />));
    } else {
      desktopBtns.push(<PgNumBtn pgNum={1} />);
      desktopBtns.push(<PgNumBtn pgNum={2} />);
      desktopBtns.push(<Spacer />);
      desktopBtns.push(<PgNumBtn pgNum={currentPage - 2} />);
      desktopBtns.push(<PgNumBtn pgNum={currentPage - 1} />);
      desktopBtns.push(<PgNumBtn pgNum={currentPage} />);
      desktopBtns.push(<PgNumBtn pgNum={currentPage + 1} />);
      desktopBtns.push(<PgNumBtn pgNum={currentPage + 2} />);
      desktopBtns.push(<Spacer />);
      desktopBtns.push(<PgNumBtn pgNum={totalPages - 1} />);
      desktopBtns.push(<PgNumBtn pgNum={totalPages} />);
    }
  }

  return (
    <div className={cn("w-max auto-cols-max grid-flow-col", { className })} {...props}>
      <div className="flex gap-2">
        <PageSelectorLink to={hrefFn(currentPage - 1)} isDisabled={currentPage === 1} leftIcon={<RiArrowLeftSLine />}>
          Prev
        </PageSelectorLink>
        <div className="hidden sm:flex md:hidden gap-1">
          {tabletBtns.map((ele, i) => React.cloneElement(ele, { ...ele.props, key: i }))}
        </div>
        <div className="hidden md:flex gap-1">
          {desktopBtns.map((ele, i) => React.cloneElement(ele, { ...ele.props, key: i }))}
        </div>
        <PageSelectorLink
          to={hrefFn(currentPage + 1)}
          isDisabled={currentPage + 1 > totalPages}
          rightIcon={<RiArrowRightSLine />}
        >
          Next
        </PageSelectorLink>
      </div>
    </div>
  );
};
