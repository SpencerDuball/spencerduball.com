import * as React from "react";
import { cn } from "~/lib/util/utils";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

/* ------------------------------------------------------------------------------------------------------------
 * Define Component Variants
 * ------------------------------------------------------------------------------------------------------------ */
// Tag
const tagDefaultClasses = "grid items-center rounded";
const tagConfig = {
  variants: {
    colorScheme: {
      slate: [],
      tomato: [],
      red: [],
      crimson: [],
      pink: [],
      plum: [],
      purple: [],
      violet: [],
      indigo: [],
      blue: [],
      cyan: [],
      teal: [],
      green: [],
      grass: [],
      brown: [],
      orange: [],
      sky: [],
      mint: [],
      lime: [],
      yellow: [],
      amber: [],
    },
    variant: {
      subtle: [],
      solid: [],
      outline: [],
    },
    size: {
      sm: ["px-2", "h-5", "text-xs"],
      md: ["px-2", "h-6", "text-sm"],
      lg: ["px-3", "h-8", "text-md"],
      xl: ["px-4", "h-12", "text-lg"],
    },
  },
  compoundVariants: [
    // Add 1px correction for border size on "outline" tags
    {
      variant: "outline" as const,
      size: "sm" as const,
      className: ["px-[calc(0.5rem-1px)]", "h-[calc(1.25rem-1px)]"],
    },
    {
      variant: "outline" as const,
      size: "md" as const,
      className: ["px-[calc(0.5rem-1px)]", "h-[calc(1.5rem-1px)]"],
    },
    {
      variant: "outline" as const,
      size: "lg" as const,
      className: ["px-[calc(0.75rem-1px)]", "h-[calc(2rem-1px)]"],
    },
    ////////////////////////////////////////////////////////////////////////////////
    // Apply "slate" styles
    ////////////////////////////////////////////////////////////////////////////////
    {
      colorScheme: "slate" as const,
      variant: "subtle" as const,
      className: ["bg-slate-3", "text-slate-11"],
    },
    {
      colorScheme: "slate" as const,
      variant: "solid" as const,
      className: ["bg-slate-9", "text-slate-1"],
    },
    {
      colorScheme: "slate" as const,
      variant: "outline" as const,
      className: ["border", "border-slate-8", "text-slate-9"],
    },
    // tomato
    {
      colorScheme: "tomato" as const,
      variant: "subtle" as const,
      className: ["bg-tomato-3", "text-tomato-11"],
    },
    {
      colorScheme: "tomato" as const,
      variant: "solid" as const,
      className: ["bg-tomato-9", "text-tomato-1"],
    },
    {
      colorScheme: "tomato" as const,
      variant: "outline" as const,
      className: ["border", "border-tomato-8", "text-tomato-9"],
    },
    // red
    {
      colorScheme: "red" as const,
      variant: "subtle" as const,
      className: ["bg-red-3", "text-red-11"],
    },
    {
      colorScheme: "red" as const,
      variant: "solid" as const,
      className: ["bg-red-9", "text-red-1"],
    },
    {
      colorScheme: "red" as const,
      variant: "outline" as const,
      className: ["border", "border-red-8", "text-red-9"],
    },
    // crimson
    {
      colorScheme: "crimson" as const,
      variant: "subtle" as const,
      className: ["bg-crimson-3", "text-crimson-11"],
    },
    {
      colorScheme: "crimson" as const,
      variant: "solid" as const,
      className: ["bg-crimson-9", "text-crimson-1"],
    },
    {
      colorScheme: "crimson" as const,
      variant: "outline" as const,
      className: ["border", "border-crimson-8", "text-crimson-9"],
    },
    // pink
    {
      colorScheme: "pink" as const,
      variant: "subtle" as const,
      className: ["bg-pink-3", "text-pink-11"],
    },
    {
      colorScheme: "pink" as const,
      variant: "solid" as const,
      className: ["bg-pink-9", "text-pink-1"],
    },
    {
      colorScheme: "pink" as const,
      variant: "outline" as const,
      className: ["border", "border-pink-8", "text-pink-9"],
    },
    // plum
    {
      colorScheme: "plum" as const,
      variant: "subtle" as const,
      className: ["bg-plum-3", "text-plum-11"],
    },
    {
      colorScheme: "plum" as const,
      variant: "solid" as const,
      className: ["bg-plum-9", "text-plum-1"],
    },
    {
      colorScheme: "plum" as const,
      variant: "outline" as const,
      className: ["border", "border-plum-8", "text-plum-9"],
    },
    // purple
    {
      colorScheme: "purple" as const,
      variant: "subtle" as const,
      className: ["bg-purple-3", "text-purple-11"],
    },
    {
      colorScheme: "purple" as const,
      variant: "solid" as const,
      className: ["bg-purple-9", "text-purple-1"],
    },
    {
      colorScheme: "purple" as const,
      variant: "outline" as const,
      className: ["border", "border-purple-8", "text-purple-9"],
    },
    // violet
    {
      colorScheme: "violet" as const,
      variant: "subtle" as const,
      className: ["bg-violet-3", "text-violet-11"],
    },
    {
      colorScheme: "violet" as const,
      variant: "solid" as const,
      className: ["bg-violet-9", "text-violet-1"],
    },
    {
      colorScheme: "violet" as const,
      variant: "outline" as const,
      className: ["border", "border-violet-8", "text-violet-9"],
    },
    // indigo
    {
      colorScheme: "indigo" as const,
      variant: "subtle" as const,
      className: ["bg-indigo-3", "text-indigo-11"],
    },
    {
      colorScheme: "indigo" as const,
      variant: "solid" as const,
      className: ["bg-indigo-9", "text-indigo-1"],
    },
    {
      colorScheme: "indigo" as const,
      variant: "outline" as const,
      className: ["border", "border-indigo-8", "text-indigo-9"],
    },
    // blue
    {
      colorScheme: "blue" as const,
      variant: "subtle" as const,
      className: ["bg-blue-3", "text-blue-11"],
    },
    {
      colorScheme: "blue" as const,
      variant: "solid" as const,
      className: ["bg-blue-9", "text-blue-1"],
    },
    {
      colorScheme: "blue" as const,
      variant: "outline" as const,
      className: ["border", "border-blue-8", "text-blue-9"],
    },
    // cyan
    {
      colorScheme: "cyan" as const,
      variant: "subtle" as const,
      className: ["bg-cyan-3", "text-cyan-11"],
    },
    {
      colorScheme: "cyan" as const,
      variant: "solid" as const,
      className: ["bg-cyan-9", "text-cyan-1"],
    },
    {
      colorScheme: "cyan" as const,
      variant: "outline" as const,
      className: ["border", "border-cyan-8", "text-cyan-9"],
    },
    // teal
    {
      colorScheme: "teal" as const,
      variant: "subtle" as const,
      className: ["bg-teal-3", "text-teal-11"],
    },
    {
      colorScheme: "teal" as const,
      variant: "solid" as const,
      className: ["bg-teal-9", "text-teal-1"],
    },
    {
      colorScheme: "teal" as const,
      variant: "outline" as const,
      className: ["border", "border-teal-8", "text-teal-9"],
    },
    // green
    {
      colorScheme: "green" as const,
      variant: "subtle" as const,
      className: ["bg-green-3", "text-green-11"],
    },
    {
      colorScheme: "green" as const,
      variant: "solid" as const,
      className: ["bg-green-9", "text-green-1"],
    },
    {
      colorScheme: "green" as const,
      variant: "outline" as const,
      className: ["border", "border-green-8", "text-green-9"],
    },
    // grass
    {
      colorScheme: "grass" as const,
      variant: "subtle" as const,
      className: ["bg-grass-3", "text-grass-11"],
    },
    {
      colorScheme: "grass" as const,
      variant: "solid" as const,
      className: ["bg-grass-9", "text-grass-1"],
    },
    {
      colorScheme: "grass" as const,
      variant: "outline" as const,
      className: ["border", "border-grass-8", "text-grass-9"],
    },
    // brown
    {
      colorScheme: "brown" as const,
      variant: "subtle" as const,
      className: ["bg-brown-3", "text-brown-11"],
    },
    {
      colorScheme: "brown" as const,
      variant: "solid" as const,
      className: ["bg-brown-9", "text-brown-1"],
    },
    {
      colorScheme: "brown" as const,
      variant: "outline" as const,
      className: ["border", "border-brown-8", "text-brown-9"],
    },
    // orange
    {
      colorScheme: "orange" as const,
      variant: "subtle" as const,
      className: ["bg-orange-3", "text-orange-11"],
    },
    {
      colorScheme: "orange" as const,
      variant: "solid" as const,
      className: ["bg-orange-9", "text-orange-1"],
    },
    {
      colorScheme: "orange" as const,
      variant: "outline" as const,
      className: ["border", "border-orange-8", "text-orange-9"],
    },
    // sky
    {
      colorScheme: "sky" as const,
      variant: "subtle" as const,
      className: ["bg-sky-3", "text-sky-11"],
    },
    {
      colorScheme: "sky" as const,
      variant: "solid" as const,
      className: ["bg-sky-9", "text-sky-1"],
    },
    {
      colorScheme: "sky" as const,
      variant: "outline" as const,
      className: ["border", "border-sky-8", "text-sky-9"],
    },
    // mint
    {
      colorScheme: "mint" as const,
      variant: "subtle" as const,
      className: ["bg-mint-3", "text-mint-11"],
    },
    {
      colorScheme: "mint" as const,
      variant: "solid" as const,
      className: ["bg-mint-9", "text-mint-1"],
    },
    {
      colorScheme: "mint" as const,
      variant: "outline" as const,
      className: ["border", "border-mint-8", "text-mint-9"],
    },
    // lime
    {
      colorScheme: "lime" as const,
      variant: "subtle" as const,
      className: ["bg-lime-3", "text-lime-11"],
    },
    {
      colorScheme: "lime" as const,
      variant: "solid" as const,
      className: ["bg-lime-9", "text-lime-1"],
    },
    {
      colorScheme: "lime" as const,
      variant: "outline" as const,
      className: ["border", "border-lime-8", "text-lime-9"],
    },
    // yellow
    {
      colorScheme: "yellow" as const,
      variant: "subtle" as const,
      className: ["bg-yellow-3", "text-yellow-11"],
    },
    {
      colorScheme: "yellow" as const,
      variant: "solid" as const,
      className: ["bg-yellow-9", "text-yellow-1"],
    },
    {
      colorScheme: "yellow" as const,
      variant: "outline" as const,
      className: ["border", "border-yellow-8", "text-yellow-9"],
    },
    // amber
    {
      colorScheme: "amber" as const,
      variant: "subtle" as const,
      className: ["bg-amber-3", "text-amber-11"],
    },
    {
      colorScheme: "amber" as const,
      variant: "solid" as const,
      className: ["bg-amber-9", "text-amber-1"],
    },
    {
      colorScheme: "amber" as const,
      variant: "outline" as const,
      className: ["border", "border-amber-8", "text-amber-9"],
    },
  ],
  defaultVariants: {
    colorScheme: "slate" as const,
    variant: "solid" as const,
    size: "md" as const,
  },
};
const tagVariants = cva(tagDefaultClasses.split(" "), tagConfig);

/* ------------------------------------------------------------------------------------------------------------
 * Component Context
 * ------------------------------------------------------------------------------------------------------------ */
// No context.

/* ------------------------------------------------------------------------------------------------------------
 * Components
 * ------------------------------------------------------------------------------------------------------------ */
// Tag
interface TagProps extends React.ComponentProps<"div">, VariantProps<typeof tagVariants> {}
const Tag = React.forwardRef<HTMLDivElement, TagProps>(({ colorScheme, variant, size, className, ...props }, ref) => {
  return <div className={cn(tagVariants({ colorScheme, variant, size, className }))} {...props} />;
});

// ColorList
export const ColorList = Object.keys(tagConfig.variants.colorScheme) as NonNullable<TagProps["colorScheme"]>[];

/**
 * Will generate a predictable color from a list of supplied colors based upon the name.
 * @param name The name of the item.
 * @param colors The list of colors.
 */
export interface ColorFromNameArgs<T> {
  name: string;
  colors: T[];
}
export function colorFromName<T extends string>({ name, colors }: ColorFromNameArgs<T>) {
  const nameId = Array.from(name)
    .map((char) => char.charCodeAt(0))
    .reduce((prev, curr) => prev + curr);
  const colorIdx = nameId % colors.length;
  return colors[colorIdx];
}

export type { TagProps };
export { Tag, tagConfig };
