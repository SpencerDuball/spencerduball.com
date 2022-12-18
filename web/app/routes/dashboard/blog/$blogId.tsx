import { json, redirect } from "@remix-run/node";
import type { LoaderArgs, ActionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Box } from "@chakra-ui/react";
import { ChakraGapHeight } from "~/root";
import { ChakraHeaderHeight, MdxEditor, MdxEditorProvider, ZAttachment } from "~/components";
import { getBlog, preview, updateBlog, getPresignedPost } from "~/model/blog.server";
import { z } from "zod";
import { ZBlog } from "table";
import { HttpError } from "~/util";

export const action = async ({ request, params }: ActionArgs) => {
  const formData = await request.formData();

  switch (formData.get("_action")) {
    case "preview": {
      return await preview(formData.get("mdx"));
    }
    case "save": {
      const mdx = z.string().parse(formData.get("mdx"));
      const attachments = ZAttachment.array()
        .parse(JSON.parse(formData.get("attachments")?.toString() || ""))
        .filter(({ type }) => type === "remote");
      console.log(attachments);
      if (params.blogId)
        return await updateBlog(params.blogId!, { mdx })
          .then(() => json({ status: "successful save" }, 200))
          .catch(() => json({ status: "unsuccessful save" }, 400));
    }
    case "upload-attachment": {
      const attachment = ZAttachment.parse(JSON.parse(formData.get("attachment")?.toString() || ""));
      if (!params.blogId) throw new HttpError(400, "Things be wrong yarg");
      const postInfo = await getPresignedPost(params.blogId, attachment);
      return json(postInfo, 200);
    }
  }

  return null;
};

export const loader = async ({ params }: LoaderArgs) => {
  // get the blog record
  const { mdx } = await z
    .string()
    .parseAsync(params.blogId)
    .then(async (blogId) => ZBlog.extend({ mdx: z.string() }).parse(await getBlog(blogId, "withMdx")))
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
