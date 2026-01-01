# TanStack Start + shadcn/ui

This is a template for a new TanStack Start project with React, TypeScript, and shadcn/ui.

# Shadcn Styles

https://ui.shadcn.com/create?base=base&style=lyra&baseColor=stone&theme=amber&iconLibrary=hugeicons&font=jetbrains-mono&radius=none

# Todo

- [x] Consolidate the "Welcome" from the index page
- [x] Create a file & schema for paginated posts & pagination on the posts page
- [x] Change the pagination numbers to not be divisible by 5, check that this works correctly
- [x] Build a script to generate lorem ipsum
- [x] Use Figma to correctly build the favicon. This has metadata from excalidraw
- [x] Correct the favicons to use correct dark favicon
- [x] Generate all metadata (head, favicon, etc) for publishing, use `realfavicongenerator.net` for this
- [x] Create a global 404 route
- [ ] Setup the Markdoc
  - [x] Update the generator script for sample posts, should have .mdoc extension
  - [x] Create the base configuration for markdoc (only need frontmatter validation to this point)
  - [x] Update the `model/post.ts` server functions & caching
  - [x] Update the `routes/posts.p.$slug.tsx` to render with Markdoc
  - [ ] Update the styles.css to use tailwind colors not shadcn colors.
  - [ ] Use the tailwind prose as reference to build out the correct styles for all markdoc components. Use semantic styles
  - [ ] Complete the initial set of components for Markdoc that are already supported
  - [ ] Complete the initial layout and design for the post displays
  - [ ] Ensure a table of contents for both desktop and mobile is available
  - [ ] Start adding the custom tags wanted from the Material for Mkdocs site, just use Markdoc tags - this is probably just better.
- [ ] Add better error handling and `errorComponent` to the routes with path parameters.
- [ ] Add in the "moving ants" underline animation to the BlogLi elements
- [ ] Add in the "moving wavy" underline animation to the top-level navigation
- [ ] (maybe) Add an icon animation to the title for "Posts", "Projects", "Series" headers. Could be a quill moving, construction hammer, lights in series or train?
- [ ] Add in snake animation to the 404 page
