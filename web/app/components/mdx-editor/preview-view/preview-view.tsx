import type { BoxProps } from "@chakra-ui/react";
import { useActionData } from "@remix-run/react";
import { BlogPost } from "~/components/blog-post";
import { ZPreviewResponse } from "~/model/blog.shared";

// PreviewView
////////////////////////////////////////////////////////////////////////////////
export interface PreviewViewProps extends BoxProps {}

export const PreviewView = (props: PreviewViewProps) => {
  const actionData = useActionData();

  const blogRes = ZPreviewResponse.safeParse(actionData);
  if (!blogRes.success) return null;

  return <BlogPost marginX="auto" maxW="container.md" blog={blogRes.data} {...props} />;
};
