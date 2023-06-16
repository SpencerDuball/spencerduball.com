import type { Schema } from "@markdoc/markdoc";
import React from "react";
import { Image } from "./Image";
import { Link } from "./Link";

export const paragraph: Schema = {
  render: "Paragraph",
  children: ["inline"],
};

export interface ParagraphProps {
  children: React.ReactNode;
}
export function Paragraph({ children }: ParagraphProps) {
  // Fix to prevent Img tag from appearing as descendent of P tag.
  if (React.isValidElement(children)) {
    if (children.type === Image) return children;
    else if (children.type === Link) return children;
  } else return <p className="mt-4 leading-6 text-base">{children}</p>;
}
