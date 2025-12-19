import { HeadContent, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { setThemeInLoader, ThemeProvider } from "@/components/ctx/theme/context";

export const Route = createRootRoute({
  loader: setThemeInLoader,
  component: RootRoute,
});

function RootRoute() {
  const theme = Route.useLoaderData();

  return (
    <>
      <HeadContent />
      <ThemeProvider theme={theme}>
        <Outlet />
      </ThemeProvider>
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
