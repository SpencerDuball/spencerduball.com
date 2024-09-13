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
import "@fontsource-variable/inter/index.css"; // <-- For some reason need to import the without "?url" and don't add to "links"????

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
  { rel: "stylesheet", href: tailwindcss }, // <-- Add this line.
];
```

Now doing further reading, if there is a modification to only the root route we will have HMR issues, if we do this instead but don't modify root route - no HMR issues will persist:

```tsx
// File: root.tsx

// import css files
import "./tailwind.css";
import "@fontsource-variable/inter/index.css";

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
];
```

# Todo

- [x] Finish setting up the sessions, rolling sessions, etc.
  - [x] Have a function that retrieves the secrets and inspects the expires-at time of the last secret. It should not make a request to the database until this expires at time is past due. These secrets should be stored in a variable in memory.
  - [x] Need to completely redo the Remix cookie and session APIs. These don't work well for a few different reasons:
    - If trying to use a function to rotate the secrets this won't work, we must pass the secrets array into the CookieFactory upon [initialization of the factory](https://github.com/remix-run/remix/blob/8f38118e44298d609224c6074ae6519d385196f1/packages/remix-server-runtime/cookies.ts#L70). The might possibly be a way to remedy this by wrapping this in another function and creating a new factory each time, but will probably just be better to get rid of this concept and create new Cookie api.
    - Actually, if we look here at [the node `createCookie` implementation](https://github.com/remix-run/remix/blob/8f38118e44298d609224c6074ae6519d385196f1/packages/remix-node/implementations.ts#L10) we might be able to supply custom `sign` and `unsign` function instead. This would alleviate the signature problem.
    - Meh, looked again and the [`sign` and `unsign`](https://github.com/remix-run/remix/blob/8f38118e44298d609224c6074ae6519d385196f1/packages/remix-node/crypto.ts#L4) funciton still expect to be passed the secret. Technically, I could just discard the secret value they provide but this is pretty dirty. I would also need to pass some dummy secrets in the factory or else the cookie wouldn't know to sign or not.
    - If we could create a PR that would modify the Cookie to allow for an async function to retrieve the secrets that would be great.
    - Still we will need to create a custom Session API, there are more issues here:
      - I don't want to support flash messages on this session cookie. This would need to be stored in the database, and it would just be easier to have a separate cookie for this instead.
      - I don't like that I can't tell the cookie what it's expires/maxAge will be. For example, I want to create the session in the database and **then** tell the cookie this limit - I don't want the cookie creation to dictate what the expires will be in the database.
      - The session API is actually pretty light, the cookie API is much more heavy.u
- [x] Update the session cookie to hold the session cookie info. This includes the `id`, `user_id`, `expires_at`, `modified_at`, `created_at`. This way when doing the session check (on each request) we don't need to make a second request to the database. This would add an additional network roundtrip on every request for session information.
- [ ] Finish adding in the flash cookie, and update routes to use flash cookie for notifications to users
- [x] Add in mocks for the auth
- [x] Add the seed data
- [ ] Create tests for all of the auth, sessions, cookie, github signin, preferences cookie, flash cookie.
- [ ] Create & publish Kyselyx package
- [ ] Create & publish web-serve package (name appropriately)
- [ ] Blog about the common CSS tricks:
  - https://css-tricks.com/almanac/properties/l/line-clamp/
  - https://lechihuy.dev/en/blog/how-to-use-calc-in-tailwind-css

## Misc

- [ ] Create an issue to update the `@vercel/ms` when they fix the https://github.com/vercel/ms/issues/184.

## Kyselyx

- [ ] Only apply seeds that have a timestamp after the migration
- [ ] When going down a migration, determine which seeds need to be dropped based upon timestamps
- [ ] When going down all migrations, drop all seeds
- [ ] Maybe can create a "clear" command that runs all "drop" commands regardless of state, it should also have a statement that drops the "kyselyx\_\*" tables for a full reset. Need to advise in docs that all "drop" commands should be resiliant to failures if a database doesn't exist for example.
- [ ] Maybe can create a "reset" command that runs a "clear", and then runs "migrate" + "seed". This is really just a convenience method.
- [ ] Add a silent option to all commands, maybe as cli flag?

## Web-Serve

- [ ] Publish this package and respond to the discussion: https://github.com/remix-run/remix/discussions/2935#discussioncomment-10485073

## Docs

- [ ] Create a desing doc that explains the (so far) 4 docker images used in this app. Structure the docs in subfolders for each image too (and futher as necessary). In the MINIO section, ensure to explain about the CloudFlare caching strategy to reduce bandwidth concerns.
- [ ] Update and add the `auth.md` design doc from the trunk. This was very good, but should also add information about rotating session secrets and other points.
- [ ] Add a design doc about creating a `cron` image that calls a webhook. This is nice because all application logic still resides in the remix app.
- [ ] Add a design doc explaining about logging (include context `reqId`, include `traceId`, include `pino-http`). Do this after setting up a strategy for maintaining and deleting log files on the filesystem. Maybe discuss about pino transports a litte too.
