import type { ActionFunction } from "@remix-run/node";
import { Box } from "@chakra-ui/react";
import { ChakraHeaderHeight } from "~/components";
import { ChakraGapHeight } from "~/root";
import { MdxEditor, MdxEditorProvider } from "~/components";
import { preview } from "~/model/blog.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  // handle actions
  switch (formData.get("_action")) {
    case "mdx-editor-preview":
      return await preview(formData.get("mdx-editor-value"));
  }

  return null;
};

export default function New() {
  return (
    <Box h={`calc(100vh - ${(ChakraHeaderHeight + ChakraGapHeight) * 4}px)`} maxW={`calc(100vw - ${8 * 4}px)`} pb={8}>
      <MdxEditorProvider>
        <MdxEditor h="full" />
      </MdxEditorProvider>
    </Box>
  );
}
