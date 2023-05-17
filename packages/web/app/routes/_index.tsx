import React from "react";
import { json } from "@remix-run/node";
import type { V2_MetaFunction, LoaderArgs } from "@remix-run/node";
import Markdoc from "@markdoc/markdoc";
import { useLoaderData } from "@remix-run/react";
import { sum } from "@spencerduballcom/ddb";

function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid bg-slate-5 rounded shadow-lg w-max p-2 m-3">
      <p className="font-bold">{title}</p>
      <span>{children}</span>
    </div>
  );
}

const callout = {
  render: "Callout",
  children: ["paragraph", "tag", "list"],
  attributes: {
    type: {
      type: String,
      default: "note",
      matches: ["check", "error", "note", "warning"],
    },
    title: {
      type: String,
    },
  },
};

export const meta: V2_MetaFunction = () => {
  return [{ title: "New Remix App" }];
};

export async function loader({ request }: LoaderArgs) {
  const ast = Markdoc.parse(
    `# Hello There!\nThis is some markdoc :)\n{% callout title="Welp Ayo" %}\nTags are composable\n{% /callout %}`
  );
  const content = Markdoc.transform(ast, { tags: { callout } });

  return json({ content });
}

export default function Index() {
  const { content } = useLoaderData<typeof loader>();

  return (
    <div>
      {Markdoc.renderers.react(content, React, { components: { Callout } })}
      <h1 className="font-bold bg-red-9">Welcome to Remix</h1>
      <ul>
        <li>
          <a target="_blank" href="https://remix.run/tutorials/blog" rel="noreferrer">
            15m Quickstart Blog Tutorial
            {sum(1, 4)}
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/tutorials/jokes" rel="noreferrer">
            Deep Dive Jokes App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
      </ul>
    </div>
  );
}
