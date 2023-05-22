import { nodes } from "@markdoc/markdoc";
import type { Schema } from "@markdoc/markdoc";
import React from "react";

export const heading: Schema = {
  render: "Heading",
  children: ["inline"],
  attributes: {
    level: { type: Number, required: true },
  },
};

export interface HeadingProps {
  level: number;
  children: React.ReactNode;
}
export function Heading({ level, children }: HeadingProps) {
  if (level === 1) return <h1 className="mt-16 mb-1 text-3xl leading-tight font-bold tracking-tight">{children}</h1>;
  else if (level === 2)
    return <h2 className="mt-14 mb-2 text-2xl leading-tight font-semibold tracking-tight [&+h3]:mt-6">{children}</h2>;
  else if (level === 3) return <h3 className="mt-12 text-xl leading-tight font-semibold tracking-tight">{children}</h3>;
  else return React.createElement(`h${level}`, { className: "mt-12 text-lg leading-snug font-semibold" }, children);
}
