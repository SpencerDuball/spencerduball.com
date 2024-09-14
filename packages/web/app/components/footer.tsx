import React from "react";
import { RiGithubFill, RiLoginCircleLine, RiTwitterXFill } from "react-icons/ri";
import { PrintablesIcon } from "~/components/icons";
import { IconButton } from "~/components/ui/icon-button";
import { cn } from "~/util";

export interface FooterProps extends React.HTMLProps<HTMLDivElement> {}

export function Footer({ className, ...props }: FooterProps) {
  return (
    <footer className={cn(`grid h-20 w-full justify-items-center`, className)} {...props}>
      <div className="grid h-full w-full max-w-5xl grid-flow-col items-center justify-between px-4">
        {/* Left Side Footer */}
        <div className="grid auto-cols-min grid-flow-col gap-2">
          <a
            className="focus-outline h-min w-min p-2"
            href="https://twitter.com/SpencerDuball"
            target="_blank"
            rel="noopener noreferrer"
          >
            <RiTwitterXFill className="h-4 w-4 text-slate-10 dark:text-slatedark-10" />
          </a>
          <a
            className="focus-outline h-min w-min p-2"
            href="https://github.com/SpencerDuball"
            target="_blank"
            rel="noopener noreferrer"
          >
            <RiGithubFill className="h-4 w-4 text-slate-10 dark:text-slatedark-10" />
          </a>
          <a
            className="focus-outline h-min w-min p-2"
            href="https://www.printables.com/social/212303-spencer_duball/about"
            target="_blank"
            rel="noopener noreferrer"
          >
            <PrintablesIcon className="h-4 w-4 text-slate-11" />
          </a>
        </div>

        {/* Right Side Footer */}
        <div className="grid auto-cols-min grid-flow-col gap-2">
          <IconButton aria-label="Toggle Theme" variant="ghost" className="text-slate-10 dark:text-slatedark-10">
            <RiLoginCircleLine />
          </IconButton>
        </div>
      </div>
    </footer>
  );
}
