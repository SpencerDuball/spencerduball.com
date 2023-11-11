import React from "react";
import { Link, useLocation } from "@remix-run/react";
import { GlobalContext, toggleTheme } from "~/lib/context/global-ctx";
import { cn } from "~/lib/util/client";
import { IconButton } from "~/lib/ui/button";
import { RiMenu2Fill, RiMoonFill, RiSunFill } from "react-icons/ri/index.js"; // TODO: Remove the 'index.js' after this issue: https://github.com/remix-run/remix/discussions/7451
import { RxHalf2 } from "react-icons/rx/index.js"; // TODO: Remove the 'index.js' after this issue: https://github.com/remix-run/remix/discussions/7451
import * as Nav from "@radix-ui/react-navigation-menu";
import { ScrollArea, ScrollViewport } from "~/lib/ui/scroll-box";

const DesktopLinkClasses =
  "focus-outline font-semibold leading-relaxed text-slate-10 hover:text-slate-12 hover:no-underline px-2";
const LinkItemClasses = "focus-outline text-slate-10 hover:text-slate-12 hover:no-underline";

export interface HeaderProps extends React.HTMLProps<HTMLDivElement> {
  isAdmin: boolean;
}

export function Header({ isAdmin, className, ...props }: HeaderProps) {
  const { pathname } = useLocation();
  const [globalCtx, setGlobalCtx] = React.useContext(GlobalContext);

  // determine theme icon
  let ThemeIcon = <RxHalf2 />;
  if (globalCtx.theme === "dark") ThemeIcon = <RiMoonFill />;
  else if (globalCtx.theme === "light") ThemeIcon = <RiSunFill />;

  return (
    <header className={cn(`grid h-20 w-full justify-items-center`, className)} {...props}>
      <div className="grid h-full w-full max-w-5xl grid-flow-col items-center justify-between px-4">
        {/* Desktop Nav List */}
        <Nav.Root delayDuration={100} className="relative hidden md:grid">
          <Nav.List className="grid list-none grid-flow-col gap-4">
            <Nav.Item asChild>
              <Nav.Link asChild>
                <Link to="/" className={cn(DesktopLinkClasses, !!pathname.match(/^\/$/) && "text-slate-12")}>
                  Home
                </Link>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item asChild>
              <Nav.Link asChild>
                <Link
                  to="/blog"
                  className={cn(DesktopLinkClasses, !!pathname.match(/^\/blog\/?.*/) && "text-slate-12")}
                >
                  Blog
                </Link>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="grid">
              <Nav.Trigger asChild>
                <button
                  className={cn(DesktopLinkClasses, !!pathname.match(/^\/projects\/?$/))}
                  onPointerMove={(e) => e.preventDefault()}
                  onPointerLeave={(e) => e.preventDefault()}
                >
                  Projects
                </button>
              </Nav.Trigger>
              <Nav.Content
                className="relative h-full max-h-[32rem]"
                onPointerMove={(e) => e.preventDefault()}
                onPointerLeave={(e) => e.preventDefault()}
              >
                <div className="relative rounded-lg border border-slate-6 bg-slate-3 p-3 shadow-lg">
                  <div className="grid gap-2 rounded-lg bg-slate-4 p-4">
                    <Nav.Link asChild>
                      <Link to="/projects" className={cn(LinkItemClasses, !!pathname.match(/^\/projects\/?.*/))}>
                        <p className="font-semibold">Projects</p>
                        <p>Check out some of the projects I work on.</p>
                      </Link>
                    </Nav.Link>
                    <div className="grid grid-cols-2 gap-2">
                      <Nav.Link asChild>
                        <Link
                          to="/projects/software"
                          className={cn(
                            "focus-outline rounded-md p-2 text-center hover:text-slate-12 hover:no-underline bg-slate-6 font-normal text-slate-10",
                            !!pathname.match(/^\/projects\/software\/?.*/ && "bg-slate-7 font-semibold text-slate-12")
                          )}
                        >
                          Software
                        </Link>
                      </Nav.Link>
                      <Nav.Link asChild>
                        <Link
                          to="/projects/3d-print"
                          className={cn(
                            "focus-outline rounded-md p-2 text-center hover:text-slate-12 hover:no-underline bg-slate-6 font-normal text-slate-10",
                            !!pathname.match(/^\/projects\/3d-print\/?.*/ && "bg-slate-7 font-semibold text-slate-12")
                          )}
                        >
                          3D Print
                        </Link>
                      </Nav.Link>
                      <Nav.Link asChild>
                        <Link
                          to="/projects/electronics"
                          className={cn(
                            "focus-outline rounded-md p-2 text-center hover:text-slate-12 hover:no-underline bg-slate-6 font-normal text-slate-10",
                            !!pathname.match(
                              /^\/projects\/electronics\/?.*/ && "bg-slate-7 font-semibold text-slate-12"
                            )
                          )}
                        >
                          Electronics
                        </Link>
                      </Nav.Link>
                    </div>
                  </div>
                </div>
              </Nav.Content>
            </Nav.Item>
            {isAdmin && (
              <Nav.Item className="grid">
                <Nav.Trigger asChild>
                  <button
                    className={cn(DesktopLinkClasses, !!pathname.match(/^\/dashhboard\/?.*$/))}
                    onPointerMove={(e) => e.preventDefault()}
                    onPointerLeave={(e) => e.preventDefault()}
                  >
                    Dashboard
                  </button>
                </Nav.Trigger>
                <Nav.Content
                  className="relative h-full max-h-[32rem]"
                  onPointerMove={(e) => e.preventDefault()}
                  onPointerLeave={(e) => e.preventDefault()}
                >
                  <div className="relative rounded-lg border border-slate-6 bg-slate-3 p-3 shadow-lg grid gap-2">
                    <div className="grid gap-2 rounded-lg bg-slate-4 p-4">
                      <Nav.Link asChild>
                        <Link to="/dashboard" className={cn(LinkItemClasses, !!pathname.match(/^\/dashboard\/?$/))}>
                          <p className="font-semibold">Home</p>
                          <p>See the site overview and recent activity.</p>
                        </Link>
                      </Nav.Link>
                    </div>
                    <div className="grid gap-2 rounded-lg bg-slate-4 p-4">
                      <Nav.Link asChild>
                        <Link
                          to="/dashboard/analytics"
                          className={cn(LinkItemClasses, !!pathname.match(/^\/dashboard\/analytics\/?.*/))}
                        >
                          <p className="font-semibold">Analytics</p>
                          <p>See the site metrics and insights.</p>
                        </Link>
                      </Nav.Link>
                    </div>
                    <div className="grid gap-2 rounded-lg bg-slate-4 p-4">
                      <Nav.Link asChild>
                        <Link
                          to="/dashboard/cms"
                          className={cn(LinkItemClasses, !!pathname.match(/^\/dashboard\/cms\/?$/))}
                        >
                          <p className="font-semibold">Content</p>
                          <p>Create/delete/update the site content.</p>
                        </Link>
                      </Nav.Link>
                      <div className="grid grid-cols-2 gap-2">
                        <Nav.Link asChild>
                          <Link
                            to="/dashboard/cms/blog"
                            className={cn(
                              "focus-outline rounded-md p-2 text-center hover:text-slate-12 hover:no-underline bg-slate-6 font-normal text-slate-10",
                              !!pathname.match(
                                /^\/dashboard\/cms\/blog\/?.*/ && "bg-slate-7 font-semibold text-slate-12"
                              )
                            )}
                          >
                            Blog
                          </Link>
                        </Nav.Link>
                        <Nav.Link asChild>
                          <Link
                            to="/dashboard/cms/software"
                            className={cn(
                              "focus-outline rounded-md p-2 text-center hover:text-slate-12 hover:no-underline bg-slate-6 font-normal text-slate-10",
                              !!pathname.match(
                                /^\/dashboard\/cms\/software\/?.*/ && "bg-slate-7 font-semibold text-slate-12"
                              )
                            )}
                          >
                            Software
                          </Link>
                        </Nav.Link>
                        <Nav.Link asChild>
                          <Link
                            to="/dashboard/cms/3d-print"
                            className={cn(
                              "focus-outline rounded-md p-2 text-center hover:text-slate-12 hover:no-underline bg-slate-6 font-normal text-slate-10",
                              !!pathname.match(
                                /^\/dashboard\/cms\/3d-print\/?.*/ && "bg-slate-7 font-semibold text-slate-12"
                              )
                            )}
                          >
                            3D Print
                          </Link>
                        </Nav.Link>
                        <Nav.Link asChild>
                          <Link
                            to="/dashboard/cms/electronics"
                            className={cn(
                              "focus-outline rounded-md p-2 text-center hover:text-slate-12 hover:no-underline bg-slate-6 font-normal text-slate-10",
                              !!pathname.match(
                                /^\/dashboard\/cms\/electronics\/?.*/ && "bg-slate-7 font-semibold text-slate-12"
                              )
                            )}
                          >
                            Electronics
                          </Link>
                        </Nav.Link>
                      </div>
                    </div>
                  </div>
                </Nav.Content>
              </Nav.Item>
            )}
          </Nav.List>
          <Nav.Indicator className="group z-[11]">
            <div className="relative left-1/2 top-[calc(0.75rem/2+0.5rem-1px)] h-3 w-3 origin-center rounded-t-sm border-t border-l border-slate-6 bg-slate-3 group-data-[state='visible']:animate-arrow-in group-data-[state='hidden']:animate-arrow-out" />
          </Nav.Indicator>
          <Nav.Viewport className="absolute top-full z-10 mt-[calc(0.75rem/2+0.5rem)] w-[40rem] max-w-[calc(100vw-1rem*2)] data-[state='close']:animate-slide-down data-[state='open']:animate-slide-up" />
        </Nav.Root>

        {/* Movile Nav List */}
        <Nav.Root delayDuration={100} className="relative md:hidden">
          <Nav.List className="list-none">
            <Nav.Item>
              <Nav.Trigger asChild>
                <IconButton
                  variant="subtle"
                  aria-label="open navigation menu"
                  icon={<RiMenu2Fill />}
                  className="text-slate-12"
                  onPointerMove={(e) => e.preventDefault()}
                  onPointerLeave={(e) => e.preventDefault()}
                />
              </Nav.Trigger>
              <Nav.Content
                className="rounded-lg border border-slate-6 bg-slate-3 shadow-lg"
                onPointerMove={(e) => e.preventDefault()}
                onPointerLeave={(e) => e.preventDefault()}
              >
                {/* TODO: Fix the scrolly issue. */}
                {/* <ScrollArea className="h-full max-h-[calc(100vh-5rem*2)] p-3"> */}
                <ScrollArea className="p-3">
                  <ScrollViewport>
                    <nav className="grid gap-2">
                      <div className="grid gap-2 rounded-lg bg-slate-4 p-4">
                        <Nav.Link asChild>
                          <Link to="/" className={cn(LinkItemClasses, !!pathname.match(/^\/$/))}>
                            <p className="font-semibold">Home</p>
                            <p>About me, site summary, and recent activity.</p>
                          </Link>
                        </Nav.Link>
                      </div>
                      <div className="grid gap-2 rounded-lg bg-slate-4 p-4">
                        <Nav.Link asChild>
                          <Link to="/blog" className={cn(LinkItemClasses, !!pathname.match(/^\/blog\/?.*$/))}>
                            <p className="font-semibold">Blog</p>
                            <p>Check out my blog.</p>
                          </Link>
                        </Nav.Link>
                      </div>
                      <div className="grid gap-2 rounded-lg bg-slate-4 p-4">
                        <Nav.Link asChild>
                          <Link to="/projects" className={cn(LinkItemClasses, !!pathname.match(/^\/projects\/?.*$/))}>
                            <p className="font-semibold">Projects</p>
                            <p>Check out some of the projects I work on.</p>
                          </Link>
                        </Nav.Link>
                        <div className="grid grid-cols-2 gap-2">
                          <Nav.Link asChild>
                            <Link
                              to="/projects/software"
                              className={cn(
                                "focus-outline rounded-md p-2 text-center hover:text-slate-12 hover:no-underline bg-slate-6 font-normal text-slate-10",
                                !!pathname.match(
                                  /^\/projects\/software\/?.*/ && "bg-slate-7 font-semibold text-slate-12"
                                )
                              )}
                            >
                              Software
                            </Link>
                          </Nav.Link>
                          <Nav.Link asChild>
                            <Link
                              to="/projects/3d-print"
                              className={cn(
                                "focus-outline rounded-md p-2 text-center hover:text-slate-12 hover:no-underline bg-slate-6 font-normal text-slate-10",
                                !!pathname.match(
                                  /^\/projects\/3d-print\/?.*/ && "bg-slate-7 font-semibold text-slate-12"
                                )
                              )}
                            >
                              3D Print
                            </Link>
                          </Nav.Link>
                          <Nav.Link asChild>
                            <Link
                              to="/projects/electronics"
                              className={cn(
                                "focus-outline rounded-md p-2 text-center hover:text-slate-12 hover:no-underline bg-slate-6 font-normal text-slate-10",
                                !!pathname.match(
                                  /^\/projects\/electronics\/?.*/ && "bg-slate-7 font-semibold text-slate-12"
                                )
                              )}
                            >
                              Electronics
                            </Link>
                          </Nav.Link>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="grid gap-2 rounded-lg bg-slate-4 p-4">
                          <Nav.Link asChild>
                            <Link
                              to="/dashboard"
                              className={cn(LinkItemClasses, !!pathname.match(/^\/projects\/?.*$/))}
                            >
                              <p className="font-semibold">Dashboard</p>
                              <p>Create/delete/update the site content.</p>
                            </Link>
                          </Nav.Link>
                          <div className="grid grid-cols-2 gap-2">
                            <Nav.Link asChild>
                              <Link
                                to="/dashboard/analytics"
                                className={cn(
                                  "focus-outline rounded-md p-2 text-center hover:text-slate-12 hover:no-underline bg-slate-6 font-normal text-slate-10",
                                  !!pathname.match(
                                    /^\/dashboard\/analytics\/?.*/ && "bg-slate-7 font-semibold text-slate-12"
                                  )
                                )}
                              >
                                Analytics
                              </Link>
                            </Nav.Link>
                            <Nav.Link asChild>
                              <Link
                                to="/dashboard/cms"
                                className={cn(
                                  "focus-outline rounded-md p-2 text-center hover:text-slate-12 hover:no-underline bg-slate-6 font-normal text-slate-10",
                                  !!pathname.match(/^\/dashboard\/cms\/?.*/ && "bg-slate-7 font-semibold text-slate-12")
                                )}
                              >
                                Content
                              </Link>
                            </Nav.Link>
                          </div>
                        </div>
                      )}
                    </nav>
                  </ScrollViewport>
                </ScrollArea>
              </Nav.Content>
            </Nav.Item>
          </Nav.List>
          <Nav.Indicator className="group z-[11]">
            <div className="relative left-1/2 top-[calc(0.75rem/2+0.5rem-1px)] h-3 w-3 origin-center rounded-t-sm border-t border-l border-slate-6 bg-slate-3 group-data-[state='visible']:animate-arrow-in group-data-[state='hidden']:animate-arrow-out" />
          </Nav.Indicator>
          <Nav.Viewport className="absolute top-full z-10 mt-[calc(0.75rem/2+0.5rem)] w-[40rem] max-w-[calc(100vw-1rem*2)] data-[state='close']:animate-slide-down data-[state='open']:animate-slide-up" />
        </Nav.Root>

        {/* Right Side Controls */}
        <div className="grid grid-flow-col gap-2">
          <IconButton
            aria-label="Toggle Theme"
            icon={ThemeIcon}
            variant="subtle"
            className="text-slate-12 md:bg-transparent"
            onClick={() => toggleTheme([globalCtx, setGlobalCtx])}
          />
        </div>
      </div>
    </header>
  );
}
