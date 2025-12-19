import { HeadContent, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { getThemeInLoader, PrefsProvider } from "@/components/ctx/preferences/context";

export const Route = createRootRoute({
  loader: getThemeInLoader,
  component: RootRoute,
});

function RootRoute() {
  const prefs = Route.useLoaderData();

  return (
    <>
      <HeadContent />
      <PrefsProvider prefs={prefs}>
        <Outlet />
      </PrefsProvider>
      <TanStackDevtools
        config={{ position: "bottom-right" }}
        plugins={[
          {
            name: "Tanstack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  );
}
