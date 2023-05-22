import React from "react";
import { json } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Markdoc from "@markdoc/markdoc";
import { config, components } from "~/components/app/markdoc";

const sample = `---
title: Sup
hello: [one, two, three]
---
# This is Heading 1 {% font-size='300px' %}

**Here is some text for that heading.**

## This is Heading 2

Here is some text for that heading.

### This is heading 3

Here is some text for that heading.

#### This is heading 4

Here is some text for that heading.

##### This is heading 5

Here is some text for that heading.

![This is some alt](/images/default-splash-bg.png "Optional Title")
\`\`\`tsx
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.DialogOverlay[data-state='open'],
.DialogContent[data-state='open'] {
  animation: fadeIn 300ms ease-out;
}

.DialogOverlay[data-state='closed'],
.DialogContent[data-state='closed'] {
  animation: fadeOut 300ms ease-in;
}
\`\`\`

> Here is a blockquote that I can check out to see how it look.

*Hello ~~there~~ there.*

Here is a link in the middle of [Google.com](https://google.com) some text.

Hello there how \`const a = 1;\` you?
`;

export async function loader({ params, request }: LoaderArgs) {
  const ast = Markdoc.parse(sample);
  const content = Markdoc.transform(ast, config);

  return json({ content });
}

export default function Test() {
  const { content } = useLoaderData<typeof loader>();

  return (
    <div className="grid max-w-3xl px-2 sm:px-3 md:px-0 w-full">
      {Markdoc.renderers.react(content, React, { components })}
    </div>
  );
}
