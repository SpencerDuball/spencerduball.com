import type { Schema } from "@markdoc/markdoc";
import React from "react";
import { idFromHeading } from "~/lib/util";

export const heading: Schema = {
  render: "Heading",
  children: ["inline"],
  attributes: {
    id: { type: String },
    level: { type: Number, required: true },
  },
};

export interface HeadingProps {
  id?: string;
  level: number;
  children: React.ReactNode;
}
export function Heading({ id, level, children }: HeadingProps) {
  // if no ID supplied, infer it from the heading text content
  if (!id) {
    if (typeof children === "string") id = idFromHeading(children);
    else if (Array.isArray(children)) {
      id = idFromHeading(children.filter((item) => typeof item === "string").join(" "));
    }
  }

  if (level === 1)
    return (
      <a href={`#${id}`}>
        <h1 id={id} className="mt-16 mb-1 text-3xl leading-tight font-bold tracking-tight">
          {children}
        </h1>
      </a>
    );
  else if (level === 2)
    return (
      <a href={`#${id}`}>
        <h2 id={id} className="mt-14 mb-2 text-2xl leading-tight font-semibold tracking-tight [&+h3]:mt-6">
          {children}
        </h2>
      </a>
    );
  else if (level === 3)
    return (
      <a href={`#${id}`}>
        <h3 id={id} className="mt-12 text-xl leading-tight font-semibold tracking-tight">
          {children}
        </h3>
      </a>
    );
  else
    return (
      <a href={`#${id}`}>
        {React.createElement(`h${level}`, { id, className: "mt-12 text-lg leading-snug font-semibold" }, children)}
      </a>
    );
}
