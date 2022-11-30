import { redirect } from "@remix-run/node";
import type { LoaderArgs, ActionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Box } from "@chakra-ui/react";
import { ChakraGapHeight } from "~/root";
import { ChakraHeaderHeight, MdxEditor, MdxEditorProvider } from "~/components";
import { getBlog, preview, updateBlog } from "~/model/blog.server";
import { z } from "zod";
import axios from "axios";
import { ZBlog } from "table";

export const action = async ({ request, params }: ActionArgs) => {
  const formData = await request.formData();

  switch (formData.get("_action")) {
    case "preview": {
      return await preview(formData.get("mdx"));
    }
    case "save": {
      const mdx = z.string().parse(formData.get("mdx"));
      if (params.blogId) await updateBlog(params.blogId!, { mdx });
    }
  }

  return null;
};

export const loader = async ({ params }: LoaderArgs) => {
  // get the blog record
  const { mdx } = await z
    .string()
    .parseAsync(params.blogId)
    .then((blogId) => ZBlog.extend({ mdx: z.string() }).parse(getBlog(blogId, "withMdx")))
    .catch(() => {
      throw redirect("/dashboard/blog");
    });

  return { mdx };
};

export default function Blog() {
  const { mdx } = useLoaderData<typeof loader>();

  return (
    <Box maxW="full" h={`calc(100vh - ${(ChakraHeaderHeight + ChakraGapHeight) * 4}px)`} pb={8}>
      <MdxEditorProvider>
        <MdxEditor h="full" initialValue={mdx} />
      </MdxEditorProvider>
    </Box>
  );
}
