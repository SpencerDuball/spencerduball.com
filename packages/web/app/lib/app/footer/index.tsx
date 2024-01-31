import React from "react";
import { z } from "zod";
import { cn } from "~/lib/util/utils";
import type { IPublicSession } from "~/lib/util/utils.server";
import { RiTwitterXFill, RiGithubFill, RiLoginCircleLine, RiCloseLine } from "react-icons/ri";
import { PrintablesIcon } from "~/lib/ui/icon";
import { Button, IconButton } from "~/lib/ui/button";
import { type FetcherWithComponents, Link } from "@remix-run/react";
import * as Avatar from "@radix-ui/react-avatar";
import * as Dialog from "@radix-ui/react-dialog";
import { useFetcher } from "@remix-run/react";

interface SignedInIconProps {
  session: IPublicSession;
  logout: FetcherWithComponents<unknown>;
}
function SignedInIcon({ session, logout }: SignedInIconProps) {
  // get the initials of user's name
  const initials = session.name.split(" ").reduce((acc, next) => acc + next[0].toUpperCase(), "");

  return (
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
              {initials}
            </Avatar.Fallback>
          </Avatar.Root>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-blackA-6 data-[state=open]:animate-overlay-show" />
        <Dialog.Content className="fixed left-1/2 top-1/2 grid w-80 -translate-x-1/2 -translate-y-1/2 auto-cols-auto gap-4 rounded-lg border border-slate-6 bg-slate-2 p-4 shadow-lg focus:outline-none data-[state=open]:animate-content-show">
          {/* User Information */}
          <div className="grid w-full grid-flow-col grid-cols-[max-content_1fr_max-content] items-center justify-items-start gap-2">
            <Avatar.Root className="text-md relative flex h-16 w-16 overflow-hidden rounded-full">
              <Avatar.Image
                className="aspect-square h-full w-full"
                src={session.avatar_url}
                alt={`A profile photo of ${session.name}`}
              />
              <Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-slate-3">
                {initials}
              </Avatar.Fallback>
            </Avatar.Root>
            <div className="grid auto-rows-max">
              <p className="line-clamp-1 text-lg font-semibold leading-tight">{session.name}</p>
              <p className="text-sm text-slate-11">{session.username}</p>
            </div>
            <div className="self-start pl-4">
              <Dialog.Close asChild>
                <IconButton aria-label="close modal" icon={<RiCloseLine />} variant="subtle" size="xs" />
              </Dialog.Close>
            </div>
          </div>
          {/* Signout */}
          <logout.Form method="post" action="/auth/signout/github" className="w-full">
            <Button
              colorScheme="red"
              variant="solid"
              className="w-full"
              type="submit"
              loadingText="Loading ..."
              isLoading={logout.state !== "idle"}
            >
              Logout
            </Button>
          </logout.Form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export interface FooterProps extends React.HTMLProps<HTMLDivElement> {
  session: IPublicSession | null;
}

export function Footer({ session, className, ...props }: FooterProps) {
  const logout = useFetcher();

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
            <RiTwitterXFill className="h-4 w-4 text-slate-11" />
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
            <SignedInIcon session={session} logout={logout} />
          ) : (
            <Link to="/auth/signin/github">
              <IconButton
                aria-label="Toggle Theme"
                icon={<RiLoginCircleLine />}
                variant="subtle"
                className="bg-transparent text-slate-11"
              />
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
