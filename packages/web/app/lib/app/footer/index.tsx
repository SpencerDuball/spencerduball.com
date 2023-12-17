import React from "react";
import { z } from "zod";
import { cn, ZPublicSession } from "~/lib/util/utils";
import { RiTwitterFill, RiGithubFill, RiLoginCircleLine } from "react-icons/ri/index.js"; // TODO: Remove the 'index.js' after this issue: https://github.com/remix-run/remix/discussions/7451
import { PrintablesIcon } from "~/lib/ui/icon";
import { IconButton } from "~/lib/ui/button";
import { Link } from "@remix-run/react";
import * as Avatar from "@radix-ui/react-avatar";
import * as Dialog from "@radix-ui/react-dialog";

export interface FooterProps extends React.HTMLProps<HTMLDivElement> {
  session: z.infer<typeof ZPublicSession> | null;
}

export function Footer({ session, className, ...props }: FooterProps) {
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
            <RiTwitterFill className="h-4 w-4 text-slate-11" />
          </a>
          <a
            className="focus-outline h-min w-min p-2"
            href="https://github.com/SpencerDuball"
            target="_blank"
            rel="noopener noreferrer"
          >
            <RiGithubFill className="h-4 w-4 text-slate-11" />
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
          {session ? (
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button className="focus-outline">
                  <Avatar.Root className="text-md flex h-8 w-8 overflow-hidden rounded-full">
                    <Avatar.Image
                      className="aspect-square h-full w-full"
                      src={session.avatar_url}
                      alt={`A profile photo of ${session.name}`}
                    />
                    <Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-slate-3">
                      {session.name.split(" ").reduce((acc, next) => acc + next[0].toUpperCase(), "")}
                    </Avatar.Fallback>
                  </Avatar.Root>
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="bg-blackA-6 data-[state=open]:animate-overlay-show fixed inset-0"></Dialog.Overlay>
                <Dialog.Content className="data-[state=open]:animate-content-show fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg focus:outline-none p-4 bg-slate-2 shadow-lg border border-slate-6 h-64 w-80">
                  <Dialog.Close>X</Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          ) : (
            <Link to="/auth/signin/github">
              <IconButton
                aria-label="Toggle Theme"
                icon={<RiLoginCircleLine />}
                variant="subtle"
                className="text-slate-11 bg-transparent"
              />
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
