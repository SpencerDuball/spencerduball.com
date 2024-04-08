import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva("inline-grid place-items-center rounded-full border font-semibold w-max", {
  variants: {
    size: {
      xs: "px-2 py-[3px] text-[10px] leading-3 min-w-10",
      sm: "px-2.5 py-[3px] text-xs min-w-12",
      md: "px-3 py-1 text-sm min-w-14",
      lg: "px-3.5 py-1.5 text-base min-w-18",
    },
    variant: {
      solid: "",
      subtle: "",
      outline: "",
    },
    colorScheme: {
      primary: "",
      tomato: "",
      red: "",
      crimson: "",
      pink: "",
      plum: "",
      purple: "",
      violet: "",
      indigo: "",
      blue: "",
      cyan: "",
      teal: "",
      green: "",
      grass: "",
      brown: "",
      orange: "",
      sky: "",
      mint: "",
      lime: "",
      yellow: "",
      amber: "",
    },
  },
  compoundVariants: [
    // Define "primary" styles
    {
      variant: "solid",
      colorScheme: "primary",
      className: "bg-slate-12 text-slate-1 border-slate-12",
    },
    {
      variant: "subtle",
      colorScheme: "primary",
      className: "bg-slate-3 text-slate-12 border-slate-6",
    },
    {
      variant: "outline",
      colorScheme: "primary",
      className: "bg-transparent text-slate-12 border-slate-6",
    },
    // Define extra colors ...
    // tomato
    {
      variant: "solid",
      colorScheme: "tomato",
      className: "bg-tomato-9 text-slate-1 border-tomato-9",
    },
    {
      variant: "subtle",
      colorScheme: "tomato",
      className: "bg-tomato-3 text-slate-12 border-tomato-6",
    },
    {
      variant: "outline",
      colorScheme: "tomato",
      className: "bg-transparent text-slate-12 border-tomato-6",
    },
    // red
    {
      variant: "solid",
      colorScheme: "red",
      className: "bg-red-9 text-slate-1 border-red-9",
    },
    {
      variant: "subtle",
      colorScheme: "red",
      className: "bg-red-3 text-slate-12 border-red-6",
    },
    {
      variant: "outline",
      colorScheme: "red",
      className: "bg-transparent text-slate-12 border-red-6",
    },
    // crimson
    {
      variant: "solid",
      colorScheme: "crimson",
      className: "bg-crimson-9 text-slate-1 border-crimson-9",
    },
    {
      variant: "subtle",
      colorScheme: "crimson",
      className: "bg-crimson-3 text-slate-12 border-crimson-6",
    },
    {
      variant: "outline",
      colorScheme: "crimson",
      className: "bg-transparent text-slate-12 border-crimson-6",
    },
    // pink
    {
      variant: "solid",
      colorScheme: "pink",
      className: "bg-pink-9 text-slate-1 border-pink-9",
    },
    {
      variant: "subtle",
      colorScheme: "pink",
      className: "bg-pink-3 text-slate-12 border-pink-6",
    },
    {
      variant: "outline",
      colorScheme: "pink",
      className: "bg-transparent text-slate-12 border-pink-6",
    },
    // plum
    {
      variant: "solid",
      colorScheme: "plum",
      className: "bg-plum-9 text-slate-1 border-plum-9",
    },
    {
      variant: "subtle",
      colorScheme: "plum",
      className: "bg-plum-3 text-slate-12 border-plum-6",
    },
    {
      variant: "outline",
      colorScheme: "plum",
      className: "bg-transparent text-slate-12 border-plum-6",
    },
    // purple
    {
      variant: "solid",
      colorScheme: "purple",
      className: "bg-purple-9 text-slate-1 border-purple-9",
    },
    {
      variant: "subtle",
      colorScheme: "purple",
      className: "bg-purple-3 text-slate-12 border-purple-6",
    },
    {
      variant: "outline",
      colorScheme: "purple",
      className: "bg-transparent text-slate-12 border-purple-6",
    },
    // violet
    {
      variant: "solid",
      colorScheme: "violet",
      className: "bg-violet-9 text-slate-1 border-violet-9",
    },
    {
      variant: "subtle",
      colorScheme: "violet",
      className: "bg-violet-3 text-slate-12 border-violet-6",
    },
    {
      variant: "outline",
      colorScheme: "violet",
      className: "bg-transparent text-slate-12 border-violet-6",
    },
    // indigo
    {
      variant: "solid",
      colorScheme: "indigo",
      className: "bg-indigo-9 text-slate-1 border-indigo-9",
    },
    {
      variant: "subtle",
      colorScheme: "indigo",
      className: "bg-indigo-3 text-slate-12 border-indigo-6",
    },
    {
      variant: "outline",
      colorScheme: "indigo",
      className: "bg-transparent text-slate-12 border-indigo-6",
    },
    // blue
    {
      variant: "solid",
      colorScheme: "blue",
      className: "bg-blue-9 text-slate-1 border-blue-9",
    },
    {
      variant: "subtle",
      colorScheme: "blue",
      className: "bg-blue-3 text-slate-12 border-blue-6",
    },
    {
      variant: "outline",
      colorScheme: "blue",
      className: "bg-transparent text-slate-12 border-blue-6",
    },
    // cyan
    {
      variant: "solid",
      colorScheme: "cyan",
      className: "bg-cyan-9 text-slate-1 border-cyan-9",
    },
    {
      variant: "subtle",
      colorScheme: "cyan",
      className: "bg-cyan-3 text-slate-12 border-cyan-6",
    },
    {
      variant: "outline",
      colorScheme: "cyan",
      className: "bg-transparent text-slate-12 border-cyan-6",
    },
    // real
    {
      variant: "solid",
      colorScheme: "teal",
      className: "bg-teal-9 text-slate-1 border-teal-9",
    },
    {
      variant: "subtle",
      colorScheme: "teal",
      className: "bg-teal-3 text-slate-12 border-teal-6",
    },
    {
      variant: "outline",
      colorScheme: "teal",
      className: "bg-transparent text-slate-12 border-teal-6",
    },
    // green
    {
      variant: "solid",
      colorScheme: "green",
      className: "bg-green-9 text-slate-1 border-green-9",
    },
    {
      variant: "subtle",
      colorScheme: "green",
      className: "bg-green-3 text-slate-12 border-green-6",
    },
    {
      variant: "outline",
      colorScheme: "green",
      className: "bg-transparent text-slate-12 border-green-6",
    },
    // grass
    {
      variant: "solid",
      colorScheme: "grass",
      className: "bg-grass-9 text-slate-1 border-grass-9",
    },
    {
      variant: "subtle",
      colorScheme: "grass",
      className: "bg-grass-3 text-slate-12 border-grass-6",
    },
    {
      variant: "outline",
      colorScheme: "grass",
      className: "bg-transparent text-slate-12 border-grass-6",
    },
    // brown
    {
      variant: "solid",
      colorScheme: "brown",
      className: "bg-brown-9 text-slate-1 border-brown-9",
    },
    {
      variant: "subtle",
      colorScheme: "brown",
      className: "bg-brown-3 text-slate-12 border-brown-6",
    },
    {
      variant: "outline",
      colorScheme: "brown",
      className: "bg-transparent text-slate-12 border-brown-6",
    },
    // orange
    {
      variant: "solid",
      colorScheme: "orange",
      className: "bg-orange-9 text-slate-1 border-orange-9",
    },
    {
      variant: "subtle",
      colorScheme: "orange",
      className: "bg-orange-3 text-slate-12 border-orange-6",
    },
    {
      variant: "outline",
      colorScheme: "orange",
      className: "bg-transparent text-slate-12 border-orange-6",
    },
    // sky
    {
      variant: "solid",
      colorScheme: "sky",
      className: "bg-sky-9 text-slate-1 border-sky-9",
    },
    {
      variant: "subtle",
      colorScheme: "sky",
      className: "bg-sky-3 text-slate-12 border-sky-6",
    },
    {
      variant: "outline",
      colorScheme: "sky",
      className: "bg-transparent text-slate-12 border-sky-6",
    },
    // mint
    {
      variant: "solid",
      colorScheme: "mint",
      className: "bg-mint-9 text-slate-1 border-mint-9",
    },
    {
      variant: "subtle",
      colorScheme: "mint",
      className: "bg-mint-3 text-slate-12 border-mint-6",
    },
    {
      variant: "outline",
      colorScheme: "mint",
      className: "bg-transparent text-slate-12 border-mint-6",
    },
    // lime
    {
      variant: "solid",
      colorScheme: "lime",
      className: "bg-lime-9 text-slate-1 border-lime-9",
    },
    {
      variant: "subtle",
      colorScheme: "lime",
      className: "bg-lime-3 text-slate-12 border-lime-6",
    },
    {
      variant: "outline",
      colorScheme: "lime",
      className: "bg-transparent text-slate-12 border-lime-6",
    },
    // yellow
    {
      variant: "solid",
      colorScheme: "yellow",
      className: "bg-yellow-9 text-slate-1 border-yellow-9",
    },
    {
      variant: "subtle",
      colorScheme: "yellow",
      className: "bg-yellow-3 text-slate-12 border-yellow-6",
    },
    {
      variant: "outline",
      colorScheme: "yellow",
      className: "bg-transparent text-slate-12 border-yellow-6",
    },
    // amber
    {
      variant: "solid",
      colorScheme: "amber",
      className: "bg-amber-9 text-slate-1 border-amber-9",
    },
    {
      variant: "subtle",
      colorScheme: "amber",
      className: "bg-amber-3 text-slate-12 border-amber-6",
    },
    {
      variant: "outline",
      colorScheme: "amber",
      className: "bg-transparent text-slate-12 border-amber-6",
    },
  ],
  defaultVariants: {
    size: "md",
    variant: "solid",
    colorScheme: "primary",
  },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ size, variant, colorScheme, className, ...props }: BadgeProps) {
  return <div className={badgeVariants({ size, variant, colorScheme, className })} {...props} />;
}

export { Badge, badgeVariants };
