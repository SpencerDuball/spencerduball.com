import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import React from "react";
import { Button } from "@/components/ui/button";
import { usePrefs, usePrefsDispatch } from "@/components/ctx/prefs/context";
import {
  Moon01Icon,
  Sun03Icon,
  SolarSystem01Icon,
  NewTwitterIcon,
  GithubIcon,
  CopyrightIcon,
  Search01Icon,
  Menu11Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { PrintablesIcon } from "@/components/icons";

export const Route = createFileRoute("/")({
  component: Component,
});

// -------------------------------------------------------------------------------------
// Header
// -------------------------------------------------------------------------------------

function ThemeButton({ ...props }: React.ComponentProps<typeof Button>) {
  const { theme } = usePrefs();
  const dispatch = usePrefsDispatch();

  const [icon, setIcon] = React.useState(SolarSystem01Icon);
  React.useEffect(() => {
    if (theme.app.actual === "system") setIcon(SolarSystem01Icon);
    else if (theme.app.actual === "dark") setIcon(Moon01Icon);
    else if (theme.app.actual === "light") setIcon(Sun03Icon);
  }, [theme.app.actual]);

  return (
    <Button variant="outline" size="icon-lg" onClick={() => dispatch({ type: "theme.app.toggle" })} {...props}>
      <HugeiconsIcon icon={icon} />
    </Button>
  );
}

function Header({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header className={cn("@container grid h-20 w-full justify-items-center", className)} {...props}>
      {/* Tablet & Desktop Nav */}
      <div className="hidden h-full w-full max-w-5xl grid-flow-col items-center justify-between px-4 @2xl:grid">
        {/* Left Side Header */}
        <div className="grid grid-flow-col items-center gap-4">
          <Link to="/" className="py-3">
            <p className="text-xl font-bold tracking-tighter @3xl:text-2xl">Spencer Duball</p>
          </Link>
          <nav className="grid grid-flow-col gap-1">
            <Link
              to="/posts"
              className="hover:text-primary dark:hover:text-primary active:text-primary dark:active:text-primary px-2 py-4 font-medium @3xl:px-3.5"
            >
              Posts
            </Link>
            <Link
              to="/posts"
              className="hover:text-primary dark:hover:text-primary active:text-primary dark:active:text-primary px-2 py-4 font-medium @3xl:px-3.5"
            >
              Projects
            </Link>
            <Link
              to="/series"
              className="hover:text-primary dark:hover:text-primary active:text-primary dark:active:text-primary px-2 py-4 font-medium @3xl:px-3.5"
            >
              Series
            </Link>
          </nav>
        </div>

        {/* Right Side Header */}
        <div className="grid auto-cols-min grid-flow-col gap-2">
          <Button
            size="lg"
            variant="outline"
            className="hover:text-foreground text-muted-foreground grid w-40 grid-flow-col justify-start"
          >
            <HugeiconsIcon icon={Search01Icon} />
            Search ...
          </Button>
          <ThemeButton />
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="grid h-full w-full max-w-5xl grid-flow-col items-center justify-between px-4 @2xl:hidden">
        {/* Left Side Header */}
        <Link to="/" className="py-3">
          <p className="text-xl font-bold tracking-tighter @3xl:text-2xl">Spencer Duball</p>
        </Link>

        {/* Right Side Header */}
        <Button size="icon-lg" variant="outline">
          <HugeiconsIcon icon={Menu11Icon} />
        </Button>
      </div>
    </header>
  );
}

// -------------------------------------------------------------------------------------
// Footer
// -------------------------------------------------------------------------------------
function Footer({ className, ...props }: React.ComponentProps<"footer">) {
  return (
    <footer className={cn("grid h-20 w-full justify-items-center", className)} {...props}>
      <div className="grid h-full w-full max-w-5xl grid-flow-col items-center justify-between px-4">
        {/* Left Side Footer */}
        <div className="grid auto-cols-min grid-flow-col gap-1">
          <Button
            variant="ghost"
            size="icon-lg"
            className="hover:text-primary dark:hover:text-primary active:text-primary dark:active:text-primary"
            render={<a href="https://x.com/SpencerDuball" target="_blank" rel="noopener noreferrer" />}
            nativeButton={false}
          >
            <HugeiconsIcon icon={NewTwitterIcon} />
          </Button>
          <Button
            variant="ghost"
            size="icon-lg"
            className="hover:text-primary dark:hover:text-primary active:text-primary dark:active:text-primary"
            render={<a href="https://github.com/SpencerDuball" target="_blank" rel="noopener noreferrer" />}
            nativeButton={false}
          >
            <HugeiconsIcon icon={GithubIcon} />
          </Button>
          <Button
            variant="ghost"
            size="icon-lg"
            className="hover:text-primary dark:hover:text-primary active:text-primary dark:active:text-primary text-stone-700 dark:text-stone-300"
            render={
              <a
                href="https://www.printables.com/social/212303-spencer_duball/about"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            nativeButton={false}
          >
            <PrintablesIcon />
          </Button>
        </div>

        {/* Right Side Footer */}
        <div className="flex items-center gap-1 text-sm">
          Copyright
          <HugeiconsIcon className="h-4 w-4" icon={CopyrightIcon} />
          2026
        </div>
      </div>
    </footer>
  );
}

// -------------------------------------------------------------------------------------
// Divider
// -------------------------------------------------------------------------------------
function Divider({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("grid w-full justify-items-center", className)} {...props}>
      <div className="w-full max-w-5xl px-4">
        <div className="w-full border-b" />
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------------------
// Component
// -------------------------------------------------------------------------------------

export function Component() {
  return (
    <div className="grid h-full min-h-dvh grid-rows-[min-content_min-content_1fr_min-content_min-content]">
      <Header />
      <Divider />
      <div className="justify-start">
        <Outlet />
      </div>
      <Divider />
      <Footer />
    </div>
  );
}
