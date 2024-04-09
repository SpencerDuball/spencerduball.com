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
      className:
        "bg-slate-12 dark:bg-slatedark-12 text-slate-1 dark:text-slatedark-1 border-slate-12 dark:border-slatedark-12",
    },
    {
      variant: "subtle",
      colorScheme: "primary",
      className:
        "bg-slate-3 dark:bg-slatedark-3 text-slate-12 dark:text-slatedark-12 border-slate-6 dark:border-slatedark-6",
    },
    {
      variant: "outline",
      colorScheme: "primary",
      className: "bg-transparent text-slate-12 dark:text-slatedark-12 border-slate-6 dark:border-slatedark-6",
    },
    // Define extra colors ...
    // tomato
    {
      variant: "solid",
      colorScheme: "tomato",
      className:
        "bg-tomato-9 dark:bg-tomatodark-9 text-slate-1 dark:text-slatedark-1 border-tomato-9 dark:border-tomatodark-9",
    },
    {
      variant: "subtle",
      colorScheme: "tomato",
      className:
        "bg-tomato-3 dark:bg-tomatodark-3 text-slate-12 dark:text-slatedark-12 border-tomato-6 dark:border-tomatodark-6",
    },
    {
      variant: "outline",
      colorScheme: "tomato",
      className: "bg-transparent text-slate-12 dark:text-slatedark-12 border-tomato-6 dark:border-tomatodark-6",
    },
    // red
    {
      variant: "solid",
      colorScheme: "red",
      className: "bg-red-9 dark:bg-reddark-9 text-slate-1 dark:text-slatedark-1 border-red-9 dark:border-reddark-9",
    },
    {
      variant: "subtle",
      colorScheme: "red",
      className: "bg-red-3 dark:bg-reddark-3 text-slate-12 dark:text-slatedark-12 border-red-6 dark:border-reddark-6",
    },
    {
      variant: "outline",
      colorScheme: "red",
      className: "bg-transparent text-slate-12 dark:text-slatedark-12 border-red-6 dark:border-reddark-6",
    },
    // crimson
    {
      variant: "solid",
      colorScheme: "crimson",
      className:
        "bg-crimson-9 dark:bg-crimsondark-9 text-slate-1 dark:text-slatedark-1 border-crimson-9 dark:border-crimsondark-9",
    },
    {
      variant: "subtle",
      colorScheme: "crimson",
      className:
        "bg-crimson-3 dark:bg-crimsondark-3 text-slate-12 dark:text-slatedark-12 border-crimson-6 dark:border-crimsondark-6",
    },
    {
      variant: "outline",
      colorScheme: "crimson",
      className: "bg-transparent text-slate-12 dark:text-slatedark-12 border-crimson-6 dark:border-crimsondark-6",
    },
    // pink
    {
      variant: "solid",
      colorScheme: "pink",
      className: "bg-pink-9 dark:bg-pinkdark-9 text-slate-1 dark:text-slatedark-1 border-pink-9 dark:border-pinkdark-9",
    },
    {
      variant: "subtle",
      colorScheme: "pink",
      className:
        "bg-pink-3 dark:bg-pinkdark-3 text-slate-12 dark:text-slatedark-12 border-pink-6 dark:border-pinkdark-6",
    },
    {
      variant: "outline",
      colorScheme: "pink",
      className: "bg-transparent text-slate-12 dark:text-slatedark-12 border-pink-6 dark:border-pinkdark-6",
    },
    // plum
    {
      variant: "solid",
      colorScheme: "plum",
      className: "bg-plum-9 dark:bg-plumdark-9 text-slate-1 dark:text-slatedark-1 border-plum-9 dark:border-plumdark-9",
    },
    {
      variant: "subtle",
      colorScheme: "plum",
      className:
        "bg-plum-3 dark:bg-plumdark-3 text-slate-12 dark:text-slatedark-12 border-plum-6 dark:border-plumdark-6",
    },
    {
      variant: "outline",
      colorScheme: "plum",
      className: "bg-transparent text-slate-12 dark:text-slatedark-12 border-plum-6 dark:border-plumdark-6",
    },
    // purple
    {
      variant: "solid",
      colorScheme: "purple",
      className:
        "bg-purple-9 dark:bg-purpledark-9 text-slate-1 dark:text-slatedark-1 border-purple-9 dark:border-purpledark-9",
    },
    {
      variant: "subtle",
      colorScheme: "purple",
      className:
        "bg-purple-3 dark:bg-purpledark-3 text-slate-12 dark:text-slatedark-12 border-purple-6 dark:border-purpledark-6",
    },
    {
      variant: "outline",
      colorScheme: "purple",
      className: "bg-transparent text-slate-12 dark:text-slatedark-12 border-purple-6 dark:border-purpledark-6",
    },
    // violet
    {
      variant: "solid",
      colorScheme: "violet",
      className:
        "bg-violet-9 dark:bg-violetdark-9 text-slate-1 dark:text-slatedark-1 border-violet-9 dark:border-violetdark-9",
    },
    {
      variant: "subtle",
      colorScheme: "violet",
      className:
        "bg-violet-3 dark:bg-violetdark-3 text-slate-12 dark:text-slatedark-12 border-violet-6 dark:border-violetdark-6",
    },
    {
      variant: "outline",
      colorScheme: "violet",
      className: "bg-transparent text-slate-12 dark:text-slatedark-12 border-violet-6 dark:border-violetdark-6",
    },
    // indigo
    {
      variant: "solid",
      colorScheme: "indigo",
      className:
        "bg-indigo-9 dark:bg-indigodark-9 text-slate-1 dark:text-slatedark-1 border-indigo-9 dark:border-indigodark-9",
    },
    {
      variant: "subtle",
      colorScheme: "indigo",
      className:
        "bg-indigo-3 dark:bg-indigodark-3 text-slate-12 dark:text-slatedark-12 border-indigo-6 dark:border-indigodark-6",
    },
    {
      variant: "outline",
      colorScheme: "indigo",
      className: "bg-transparent text-slate-12 dark:text-slatedark-12 border-indigo-6 dark:border-indigodark-6",
    },
    // blue
    {
      variant: "solid",
      colorScheme: "blue",
      className: "bg-blue-9 dark:bg-bluedark-9 text-slate-1 dark:text-slatedark-1 border-blue-9 dark:border-bluedark-9",
    },
    {
      variant: "subtle",
      colorScheme: "blue",
      className:
        "bg-blue-3 dark:bg-bluedark-3 text-slate-12 dark:text-slatedark-12 border-blue-6 dark:border-bluedark-6",
    },
    {
      variant: "outline",
      colorScheme: "blue",
      className: "bg-transparent text-slate-12 dark:text-slatedark-12 border-blue-6 dark:border-bluedark-6",
    },
    // cyan
    {
      variant: "solid",
      colorScheme: "cyan",
      className: "bg-cyan-9 dark:bg-cyandark-9 text-slate-1 dark:text-slatedark-1 border-cyan-9 dark:border-cyandark-9",
    },
    {
      variant: "subtle",
      colorScheme: "cyan",
      className:
        "bg-cyan-3 dark:bg-cyandark-3 text-slate-12 dark:text-slatedark-12 border-cyan-6 dark:border-cyandark-6",
    },
    {
      variant: "outline",
      colorScheme: "cyan",
      className: "bg-transparent text-slate-12 dark:text-slatedark-12 border-cyan-6 dark:border-cyandark-6",
    },
    // teal
    {
      variant: "solid",
      colorScheme: "teal",
      className: "bg-teal-9 dark:bg-tealdark-9 text-slate-1 dark:text-slatedark-1 border-teal-9 dark:border-tealdark-9",
    },
    {
      variant: "subtle",
      colorScheme: "teal",
      className:
        "bg-teal-3 dark:bg-tealdark-3 text-slate-12 dark:text-slatedark-12 border-teal-6 dark:border-tealdark-6",
    },
    {
      variant: "outline",
      colorScheme: "teal",
      className: "bg-transparent text-slate-12 dark:text-slatedark-12 border-teal-6 dark:border-tealdark-6",
    },
    // green
    {
      variant: "solid",
      colorScheme: "green",
      className:
        "bg-green-9 dark:bg-greendark-9 text-slate-1 dark:text-slatedark-1 border-green-9 dark:border-greendark-9",
    },
    {
      variant: "subtle",
      colorScheme: "green",
      className:
        "bg-green-3 dark:bg-greendark-3 text-slate-12 dark:text-slatedark-12 border-green-6 dark:border-greendark-6",
    },
    {
      variant: "outline",
      colorScheme: "green",
      className: "bg-transparent text-slate-12 dark:text-slatedark-12 border-green-6 dark:border-greendark-6",
    },
    // grass
    {
      variant: "solid",
      colorScheme: "grass",
      className:
        "bg-grass-9 dark:bg-grassdark-9 text-slate-1 dark:text-slatedark-1 border-grass-9 dark:border-grassdark-9",
    },
    {
      variant: "subtle",
      colorScheme: "grass",
      className:
        "bg-grass-3 dark:bg-grassdark-3 text-slate-12 dark:text-slatedark-12 border-grass-6 dark:border-grassdark-6",
    },
    {
      variant: "outline",
      colorScheme: "grass",
      className: "bg-transparent text-slate-12 dark:text-slatedark-12 border-grass-6 dark:border-grassdark-6",
    },
    // brown
    {
      variant: "solid",
      colorScheme: "brown",
      className:
        "bg-brown-9 dark:bg-browndark-9 text-slate-1 dark:text-slatedark-1 border-brown-9 dark:border-browndark-9",
    },
    {
      variant: "subtle",
      colorScheme: "brown",
      className:
        "bg-brown-3 dark:bg-browndark-3 text-slate-12 dark:text-slatedark-12 border-brown-6 dark:border-browndark-6",
    },
    {
      variant: "outline",
      colorScheme: "brown",
      className: "bg-transparent text-slate-12 dark:text-slatedark-12 border-brown-6 dark:border-browndark-6",
    },
    // orange
    {
      variant: "solid",
      colorScheme: "orange",
      className:
        "bg-orange-9 dark:bg-orangedark-9 text-slate-1 dark:text-slatedark-1 border-orange-9 dark:border-orangedark-9",
    },
    {
      variant: "subtle",
      colorScheme: "orange",
      className:
        "bg-orange-3 dark:bg-orangedark-3 text-slate-12 dark:text-slatedark-12 border-orange-6 dark:border-orangedark-6",
    },
    {
      variant: "outline",
      colorScheme: "orange",
      className: "bg-transparent text-slate-12 dark:text-slatedark-12 border-orange-6 dark:border-orangedark-6",
    },
    // sky
    {
      variant: "solid",
      colorScheme: "sky",
      className: "bg-sky-9 dark:bg-skydark-9 text-slate-1 dark:text-slatedark-1 border-sky-9 dark:border-skydark-9",
    },
    {
      variant: "subtle",
      colorScheme: "sky",
      className: "bg-sky-3 dark:bg-skydark-3 text-slate-12 dark:text-slatedark-12 border-sky-6 dark:border-skydark-6",
    },
    {
      variant: "outline",
      colorScheme: "sky",
      className: "bg-transparent text-slate-12 dark:text-slatedark-12 border-sky-6 dark:border-skydark-6",
    },
    // mint
    {
      variant: "solid",
      colorScheme: "mint",
      className: "bg-mint-9 dark:bg-mintdark-9 text-slate-1 dark:text-slatedark-1 border-mint-9 dark:border-mintdark-9",
    },
    {
      variant: "subtle",
      colorScheme: "mint",
      className:
        "bg-mint-3 dark:bg-mintdark-3 text-slate-12 dark:text-slatedark-12 border-mint-6 dark:border-mintdark-6",
    },
    {
      variant: "outline",
      colorScheme: "mint",
      className: "bg-transparent text-slate-12 dark:text-slatedark-12 border-mint-6 dark:border-mintdark-6",
    },
    // lime
    {
      variant: "solid",
      colorScheme: "lime",
      className: "bg-lime-9 dark:bg-limedark-9 text-slate-1 dark:text-slatedark-1 border-lime-9 dark:border-limedark-9",
    },
    {
      variant: "subtle",
      colorScheme: "lime",
      className:
        "bg-lime-3 dark:bg-limedark-3 text-slate-12 dark:text-slatedark-12 border-lime-6 dark:border-limedark-6",
    },
    {
      variant: "outline",
      colorScheme: "lime",
      className: "bg-transparent text-slate-12 dark:text-slatedark-12 border-lime-6 dark:border-limedark-6",
    },
    // yellow
    {
      variant: "solid",
      colorScheme: "yellow",
      className:
        "bg-yellow-9 dark:bg-yellowdark-9 text-slate-1 dark:text-slatedark-1 border-yellow-9 dark:border-yellowdark-9",
    },
    {
      variant: "subtle",
      colorScheme: "yellow",
      className:
        "bg-yellow-3 dark:bg-yellowdark-3 text-slate-12 dark:text-slatedark-12 border-yellow-6 dark:border-yellowdark-6",
    },
    {
      variant: "outline",
      colorScheme: "yellow",
      className: "bg-transparent text-slate-12 dark:text-slatedark-12 border-yellow-6 dark:border-yellowdark-6",
    },
    // amber
    {
      variant: "solid",
      colorScheme: "amber",
      className:
        "bg-amber-9 dark:bg-amberdark-9 text-slate-1 dark:text-slatedark-1 border-amber-9 dark:border-amberdark-9",
    },
    {
      variant: "subtle",
      colorScheme: "amber",
      className:
        "bg-amber-3 dark:bg-amberdark-3 text-slate-12 dark:text-slatedark-12 border-amber-6 dark:border-amberdark-6",
    },
    {
      variant: "outline",
      colorScheme: "amber",
      className: "bg-transparent text-slate-12 dark:text-slatedark-12 border-amber-6 dark:border-amberdark-6",
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
