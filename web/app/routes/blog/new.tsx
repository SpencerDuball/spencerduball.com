import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Box } from "@chakra-ui/react";
import { ChakraHeaderHeight } from "~/components";
import { ChakraGapHeight } from "~/root";
import { MdxEditor } from "~/components";
import { bundle } from "~/components/mdx-editor";
import { z, ZodError } from "zod";

const ZBlogPostBundle = z.object({
  code: z.string(),
  frontmatter: z.object({
    title: z.string().min(3),
    author: z.string().min(3),
    tags: z.string().array(),
  }),
});

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  // handle actions
  switch (formData.get("_action")) {
    case "mdx-editor-preview": {
      return await z
        .string()
        .parseAsync(formData.get("mdx-editor-value"))
        .then(async (source) => ZBlogPostBundle.parseAsync(await bundle(source)))
        .then((source) => json(source))
        .catch((e: ZodError) => json({ errorMessage: e.message }, 400));
    }
  }

  return null;
};

export default function New() {
  return (
    <Box h={`calc(100vh - ${(ChakraHeaderHeight + ChakraGapHeight) * 4}px)`} maxW={`calc(100vw - ${8 * 4}px)`} pb={8}>
      <MdxEditor h="full" />
    </Box>
  );
}
