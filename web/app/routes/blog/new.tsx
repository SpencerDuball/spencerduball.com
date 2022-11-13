import type { ActionFunction } from "@remix-run/node";
import { Box } from "@chakra-ui/react";
import { ChakraHeaderHeight } from "~/components";
import { ChakraGapHeight } from "~/root";
import { MdxEditor, MdxEditorProvider } from "~/components";
import { preview } from "~/model/blog.server";

const initialValue = `---
title: New Blog Post
image: /images/default-splash-bg.png
tags: 
  - water
  - fire
  - earth
  - wind
---

# New Blog Post

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
`;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  // handle actions
  switch (formData.get("_action")) {
    case "mdx-editor-preview":
      return await preview(formData.get("mdx"));
  }

  return null;
};

export default function New() {
  return (
    <Box maxW="full" h={`calc(100vh - ${(ChakraHeaderHeight + ChakraGapHeight) * 4}px)`} pb={8}>
      <MdxEditorProvider>
        <MdxEditor h="full" initialValue={initialValue} />
      </MdxEditorProvider>
    </Box>
  );
}
