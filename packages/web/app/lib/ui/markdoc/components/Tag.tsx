import type { Schema } from "@markdoc/markdoc";
import React from "react";
import { ColorList, TagProps as _TagProps } from "~/lib/ui/tag";
import { VariantProps, cva } from "class-variance-authority";

export const tag: Schema = {
  render: "Tag",
  children: ["text"],
  attributes: {
    color: {
      type: String,
      default: "slate",
      matches: ColorList,
    },
    size: {
      type: String,
      default: "md",
      matches: ["sm", "md", "lg", "xl"],
    },
  },
};

/* ------------------------------------------------------------------------------------------------------------
 * Define Component Variants
 * ------------------------------------------------------------------------------------------------------------ */
// Tag
const tagDefaultClasses = "inline-grid items-center rounded border border-slate-4";
const tagConfig = {
  variants: {
    colorScheme: {
      slate: "bg-slate-3 text-slate-11",
      tomato: "bg-tomato-3 text-tomato-11",
      red: "bg-red-3 text-red-11",
      crimson: "bg-crimson-3 text-crimson-11",
      pink: "bg-pink-3 text-pink-11",
      plum: "bg-plum-3 text-plum-11",
      purple: "bg-purple-3 text-purple-11",
      violet: "bg-violet-3 text-violet-11",
      indigo: "bg-indigo-3 text-indigo-11",
      blue: "bg-blue-3 text-blue-11",
      cyan: "bg-cyan-3 text-cyan-11",
      teal: "bg-teal-3 text-teal-11",
      green: "bg-green-3 text-green-11",
      grass: "bg-grass-3 text-grass-11",
      brown: "bg-brown-3 text-brown-11",
      orange: "bg-orange-3 text-orange-11",
      sky: "bg-sky-3 text-sky-11",
      mint: "bg-mint-3 text-mint-11",
      lime: "bg-lime-3 text-lime-11",
      yellow: "bg-yellow-3 text-yellow-11",
      amber: "bg-amber-3 text-amber-11",
    },
    size: {
      sm: ["px-2", "h-5", "text-xs"],
      md: ["px-2", "h-6", "text-sm"],
      lg: ["px-3", "h-8", "text-md"],
      xl: ["px-4", "h-12", "text-lg"],
    },
  },
  defaultVariants: {
    colorScheme: "slate" as const,
    size: "md" as const,
  },
};
const tagVariants = cva(tagDefaultClasses.split(" "), tagConfig);

export interface TagProps {
  color: VariantProps<typeof tagVariants>["colorScheme"];
  size: VariantProps<typeof tagVariants>["size"];

  children: React.ReactNode;
}

export function Tag({ color, size, children }: TagProps) {
  return <span className={tagVariants({ colorScheme: color, size })}>{children}</span>;
}
