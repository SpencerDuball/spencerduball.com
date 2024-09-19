import { Form, useLocation } from "@remix-run/react";
import React from "react";
import {
  RiCloseLine,
  RiGithubFill,
  RiGithubLine,
  RiLoginCircleLine,
  RiLogoutCircleLine,
  RiTwitterXFill,
} from "react-icons/ri";
import { PrintablesIcon } from "~/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { IconButton } from "~/components/ui/icon-button";
import { VisuallyHidden } from "~/components/ui/visually-hidden";
import { IUserWithRoles } from "~/models/users";
import { cn } from "~/util";

// -------------------------------------------------------------------------------------
// SignedInModal
// -------------------------------------------------------------------------------------
interface SignedInModalProps {
  user: IUserWithRoles;
}
function SignedInModal({ user }: SignedInModalProps) {
  const nameParts = user.name.split(" ");
  const [firstChar, lastChar] = [
    nameParts.at(0)?.at(0)?.toUpperCase() || "",
    nameParts.at(-1)?.at(0)?.toUpperCase() || "",
  ];
  return (
    <Dialog>
      <DialogTrigger data-testid="081d7c19" aria-label="Open logout modal">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback>{`${firstChar}${lastChar}`}</AvatarFallback>
        </Avatar>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="w-[calc(100vw-theme(spacing.8))] max-w-xs gap-4 rounded-md p-4">
          <DialogHeader className="grid grid-flow-col items-center justify-between">
            <VisuallyHidden>
              <DialogTitle>User Profile</DialogTitle>
              <DialogDescription>Manage your profile.</DialogDescription>
            </VisuallyHidden>
            <div className="col-span-2 !m-0 grid w-full grid-cols-[max-content_1fr] gap-2 rounded-md">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar_url} alt={user.name} />
              </Avatar>
              <div className="grid justify-start justify-items-start self-center">
                <p className="text-md self-end overflow-hidden text-ellipsis whitespace-nowrap">{user.name}</p>
                <p className="self-start overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-11 dark:text-slatedark-11">
                  {user.username} &bull; {user.roles.join(", ")}
                </p>
              </div>
            </div>
            <DialogClose className="absolute right-4 top-4 !m-0" asChild>
              <IconButton size="xs" aria-label="Close" className="text-slate-11 dark:text-slatedark-11">
                <RiCloseLine className="h-4 w-4" />
              </IconButton>
            </DialogClose>
          </DialogHeader>
          <Form method="DELETE" action="/auth/signout/github" navigate={false} className="gap grid gap-2">
            <Button variant="solid" colorScheme="red">
              <RiLogoutCircleLine className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </Form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

// -------------------------------------------------------------------------------------
// SignedOutModal
// -------------------------------------------------------------------------------------
function SignedOutModal() {
  const [open, setOpen] = React.useState(false);

  const location = useLocation();

  const redirect_uri = /^\/mock\/github\/login\/oauth\/authorize/.test(location.pathname) ? "/" : location.pathname;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <IconButton
          data-testid="9e011d5f"
          aria-label="Open login modal"
          variant="ghost"
          className="text-slate-10 dark:text-slatedark-10"
        >
          <RiLoginCircleLine />
        </IconButton>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent
          className="w-[calc(100vw-theme(spacing.8))] max-w-xs gap-4 rounded-md p-4"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="grid">
            <div className="grid grid-flow-col items-center justify-between">
              <DialogTitle>Sign In</DialogTitle>
              <DialogClose className="" asChild>
                <IconButton size="xs" aria-label="Close" className="text-slate-11 dark:text-slatedark-11">
                  <RiCloseLine className="h-4 w-4" />
                </IconButton>
              </DialogClose>
            </div>
            <DialogDescription>Sign in to comment on posts and provide your feedback.</DialogDescription>
          </DialogHeader>
          <Form method="GET" action="/auth/signin/github" className="gap grid gap-2" onSubmit={() => setOpen(false)}>
            <input type="hidden" name="redirect_uri" value={redirect_uri} />
            <Button type="submit" variant="solid" colorScheme="primary" data-testid="a3f6c3bb">
              <RiGithubLine className="mr-2 h-4 w-4" />
              Sign in with Github
            </Button>
          </Form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

// -------------------------------------------------------------------------------------
// Footer
// -------------------------------------------------------------------------------------
export interface FooterProps extends React.ComponentPropsWithoutRef<"footer"> {
  user?: IUserWithRoles;
}

export function Footer({ user, className, ...props }: FooterProps) {
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
          {user ? <SignedInModal user={user} /> : <SignedOutModal />}
        </div>
      </div>
    </footer>
  );
}
