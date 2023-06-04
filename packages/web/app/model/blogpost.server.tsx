import yaml from "js-yaml";
import { z } from "zod";

// define the default blog template
export const defaultBlogTemplate = `---
title: New Blog Post
description: A new blog post.
image: /images/default-splash-bg.png
tags: []
---

# New Blog Post

This is a new blog post, edit the content and click the "save" button when ready. You may also:
- drag and drop images/videos onto the editor
- upload images/videos directly in the "attachments" tab
- use all standard commonmark MD features

> Note: When finished with the blogpost, you can publish the post from the dashboard.
`;

// ----------------------------------------------------------------------
// Markdoc
// ----------------------------------------------------------------------
export function validateFrontmatter(frontmatter: string) {
  return z
    .object({ title: z.string(), description: z.string(), image_url: z.string(), tags: z.string().array() })
    .parse(yaml.load(frontmatter));
}
