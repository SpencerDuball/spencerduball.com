# Dev Notes

This file will be used to track all of the little things in a project that are "good-to-know", and workarounds for common issues noticed.

## VSCode Prettier

Note that in `/package.json` we have installed `prettier@^3.x.x`, this is necessary to get the VSCode Prettier extension working properly. Without this, we will run into a cluster of ESM vs CJS issues due to the configuration file. These issues only really present because custom prettier settings are specified. As an example: See the documentation for the VSCode Prettier extension here describing this necessary package:

- https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode#prettier-version-3

Additionally, any updates to the `prettier.config.js` will require a window reload in VSCode! The extenion must be reloaded for any changes to take effect.

## Vite HMR - Context API (`context.tsx`, `provider.tsx`, `reducer.tsx`)

For some reason Vite has an issue doing HMR when you export both a `React.Context` object and context provider from the same file. You will get this error:

```bash
11:12:40 AM [vite] hmr update /app/context/global-ctx/context.tsx, /app/tailwind.css
11:12:40 AM [vite] hmr invalidate /app/context/global-ctx/context.tsx Could not Fast Refresh. Learn more at https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react#consistent-components-exports
11:12:40 AM [vite] hmr update /app/routes/_index.tsx, /app/tailwind.css, /app/root.tsx
```

And this is the comment describing the fix to have separate files for `contex.tsx` and `provider.tsx`. Note that the `reducer.tsx` is in it's own file just for readability:

- https://github.com/vitejs/vite/issues/3301#issuecomment-1080030773

## Remix CSS HMR

Per the Remix documentation, you should be able to import CSS using standard import statements:

```ts
import "./tailwind.css?url";
import "@fontsource-variable/inter/index.css?url";
```

However in practice, this does not work and you will continue to have HMR issues. The issue has been noted here https://github.com/vitejs/vite/issues/15516 but even after upgrading to `react@^18.3.1` the issue persists contrary to the conclusion of this issue.

To fix this we can instead explicitly add the CSS modules to our `links` export:

```ts
// File: root.tsx

// import css files
import tailwindcss from "./tailwind.css?url";
import inter from "@fontsource-variable/inter/index.css?url";

export const links: LinksFunction = () => [
  { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
  {
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
    href: "/favicon-32x32.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "16x16",
    href: "/favicon-16x16.png",
  },
  { rel: "manifest", href: "/site.webmanifest" },
  { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#5bbad5" },
  { rel: "stylesheet", href: inter }, // <-- Add this line.
  { rel: "stylesheet", href: tailwindcss }, // <-- Add this line.
];
```

# Todo

- [ ] Create an issue to update the `@vercel/ms` when they fix the https://github.com/vercel/ms/issues/184.
