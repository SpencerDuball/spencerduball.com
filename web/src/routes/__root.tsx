import { HeadContent, Scripts, createRootRoute, Outlet, Link } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import appCss from "../styles.css?url";
import { clientThemeScript, PrefsProvider, usePrefs, usePrefsDispatch } from "@/components/ctx/prefs/context";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Cancel01Icon,
  CopyrightIcon,
  GithubIcon,
  Menu11Icon,
  Moon01Icon,
  NewTwitterIcon,
  Search01Icon,
  SolarSystem01Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { Dialog } from "@base-ui/react/dialog";
import { PrintablesIcon } from "@/components/icons";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TanStack Start Starter" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
    scripts: [{ children: clientThemeScript }],
  }),
  shellComponent: RootDocument,
  component: RootComponent,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{ position: "bottom-right" }}
          plugins={[{ name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> }]}
        />
        <Scripts />
      </body>
    </html>
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
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className={cn("@container grid h-20 w-full justify-items-center", className)} {...props}>
      {/* Tablet & Desktop Nav */}
      <div className="hidden h-full w-full max-w-5xl grid-flow-col items-center justify-between px-4 @2xl:grid">
        {/* Left Side Header */}
        <div className="grid grid-flow-col items-center gap-4">
          <Link to="/" className="py-0.5">
            <p className="text-xl font-bold tracking-tighter @3xl:text-2xl">Spencer Duball</p>
          </Link>
          <nav className="grid grid-flow-col gap-1">
            <Link
              to="/posts"
              className="hover:text-primary dark:hover:text-primary active:text-primary dark:active:text-primary px-2 py-1.5 font-medium @3xl:px-3.5"
            >
              Posts
            </Link>
            <Link
              to="/posts"
              className="hover:text-primary dark:hover:text-primary active:text-primary dark:active:text-primary px-2 py-1.5 font-medium @3xl:px-3.5"
            >
              Projects
            </Link>
            <Link
              to="/series"
              className="hover:text-primary dark:hover:text-primary active:text-primary dark:active:text-primary px-2 py-1.5 font-medium @3xl:px-3.5"
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
        <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
          <Dialog.Trigger render={<Button size="icon-lg" variant="outline" />}>
            <HugeiconsIcon icon={Menu11Icon} />
          </Dialog.Trigger>

          <Dialog.Portal className="absolute top-0 left-0 h-full w-full">
            <Dialog.Viewport>
              {/* Dialog */}
              {/* This dialog re-implements the mobile header, dividers, and footer of */}
              {/* the main layout. This is the simplest way to get all benefits of the */}
              {/* dialog component, and clickability on the header/footers. */}
              <Dialog.Popup className="relative grid justify-items-center">
                <div className="bg-background grid h-full min-h-dvh w-full max-w-5xl grid-rows-[min-content_min-content_1fr_min-content_min-content]">
                  {/* Header */}
                  <div className="grid h-20 w-full justify-items-center">
                    <div className="grid h-full w-full max-w-5xl grid-flow-col items-center justify-between px-4">
                      <Link to="/" className="py-1">
                        <p className="text-xl font-bold tracking-tighter">Spencer Duball</p>
                      </Link>
                      <Dialog.Close render={<Button size="icon-lg" variant="outline" />}>
                        <HugeiconsIcon icon={Cancel01Icon} />
                      </Dialog.Close>
                    </div>
                  </div>
                  <Divider />
                  {/* Navigation Menu */}
                  <div className="fade-in animate-in">
                    <div className="animate-in slide-in-from-top-4 px-4 py-4 duration-200">
                      <nav className="grid auto-rows-max gap-6 text-2xl font-semibold">
                        <Link to="/posts">Posts</Link>
                        <Link to="/projects">Projects</Link>
                        <Link to="/series">Series</Link>

                        <div className="grid auto-rows-max justify-start gap-4">
                          <p className="text-muted-foreground text-sm">Settings</p>
                          <ThemeButton />
                        </div>
                      </nav>
                    </div>
                  </div>
                  <Divider />
                  <Footer />
                </div>
              </Dialog.Popup>
            </Dialog.Viewport>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  );
}

function RootComponent() {
  return (
    <PrefsProvider>
      <div className="grid h-full min-h-dvh grid-rows-[min-content_min-content_1fr_min-content_min-content]">
        {/* Standard Layout */}
        <Header />
        <Divider />
        <div className="justify-start">
          <Outlet />
        </div>
        <Divider />
        <Footer />
      </div>
    </PrefsProvider>
  );
}
