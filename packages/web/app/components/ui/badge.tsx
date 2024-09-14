import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const badgeVariants = cva("inline-grid w-max place-items-center rounded-full border font-semibold", {
  variants: {
    size: {
      xs: "min-w-10 px-2 py-[3px] text-[10px] leading-3",
      sm: "min-w-12 px-2.5 py-[3px] text-xs",
      md: "min-w-14 px-3 py-1 text-sm",
      lg: "min-w-18 px-3.5 py-1.5 text-base",
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
        "border-slate-12 bg-slate-12 text-slate-1 dark:border-slatedark-12 dark:bg-slatedark-12 dark:text-slatedark-1",
    },
    {
      variant: "subtle",
      colorScheme: "primary",
      className:
        "border-slate-6 bg-slate-3 text-slate-12 dark:border-slatedark-6 dark:bg-slatedark-3 dark:text-slatedark-12",
    },
    {
      variant: "outline",
      colorScheme: "primary",
      className: "border-slate-6 bg-transparent text-slate-12 dark:border-slatedark-6 dark:text-slatedark-12",
    },
    // Define extra colors ...
    // tomato
    {
      variant: "solid",
      colorScheme: "tomato",
      className:
        "border-tomato-9 bg-tomato-9 text-slate-1 dark:border-tomatodark-9 dark:bg-tomatodark-9 dark:text-slatedark-1",
    },
    {
      variant: "subtle",
      colorScheme: "tomato",
      className:
        "border-tomato-6 bg-tomato-3 text-slate-12 dark:border-tomatodark-6 dark:bg-tomatodark-3 dark:text-slatedark-12",
    },
    {
      variant: "outline",
      colorScheme: "tomato",
      className: "border-tomato-6 bg-transparent text-slate-12 dark:border-tomatodark-6 dark:text-slatedark-12",
    },
    // red
    {
      variant: "solid",
      colorScheme: "red",
      className: "border-red-9 bg-red-9 text-slate-1 dark:border-reddark-9 dark:bg-reddark-9 dark:text-slatedark-1",
    },
    {
      variant: "subtle",
      colorScheme: "red",
      className: "border-red-6 bg-red-3 text-slate-12 dark:border-reddark-6 dark:bg-reddark-3 dark:text-slatedark-12",
    },
    {
      variant: "outline",
      colorScheme: "red",
      className: "border-red-6 bg-transparent text-slate-12 dark:border-reddark-6 dark:text-slatedark-12",
    },
    // crimson
    {
      variant: "solid",
      colorScheme: "crimson",
      className:
        "border-crimson-9 bg-crimson-9 text-slate-1 dark:border-crimsondark-9 dark:bg-crimsondark-9 dark:text-slatedark-1",
    },
    {
      variant: "subtle",
      colorScheme: "crimson",
      className:
        "border-crimson-6 bg-crimson-3 text-slate-12 dark:border-crimsondark-6 dark:bg-crimsondark-3 dark:text-slatedark-12",
    },
    {
      variant: "outline",
      colorScheme: "crimson",
      className: "border-crimson-6 bg-transparent text-slate-12 dark:border-crimsondark-6 dark:text-slatedark-12",
    },
    // pink
    {
      variant: "solid",
      colorScheme: "pink",
      className: "border-pink-9 bg-pink-9 text-slate-1 dark:border-pinkdark-9 dark:bg-pinkdark-9 dark:text-slatedark-1",
    },
    {
      variant: "subtle",
      colorScheme: "pink",
      className:
        "border-pink-6 bg-pink-3 text-slate-12 dark:border-pinkdark-6 dark:bg-pinkdark-3 dark:text-slatedark-12",
    },
    {
      variant: "outline",
      colorScheme: "pink",
      className: "border-pink-6 bg-transparent text-slate-12 dark:border-pinkdark-6 dark:text-slatedark-12",
    },
    // plum
    {
      variant: "solid",
      colorScheme: "plum",
      className: "border-plum-9 bg-plum-9 text-slate-1 dark:border-plumdark-9 dark:bg-plumdark-9 dark:text-slatedark-1",
    },
    {
      variant: "subtle",
      colorScheme: "plum",
      className:
        "border-plum-6 bg-plum-3 text-slate-12 dark:border-plumdark-6 dark:bg-plumdark-3 dark:text-slatedark-12",
    },
    {
      variant: "outline",
      colorScheme: "plum",
      className: "border-plum-6 bg-transparent text-slate-12 dark:border-plumdark-6 dark:text-slatedark-12",
    },
    // purple
    {
      variant: "solid",
      colorScheme: "purple",
      className:
        "border-purple-9 bg-purple-9 text-slate-1 dark:border-purpledark-9 dark:bg-purpledark-9 dark:text-slatedark-1",
    },
    {
      variant: "subtle",
      colorScheme: "purple",
      className:
        "border-purple-6 bg-purple-3 text-slate-12 dark:border-purpledark-6 dark:bg-purpledark-3 dark:text-slatedark-12",
    },
    {
      variant: "outline",
      colorScheme: "purple",
      className: "border-purple-6 bg-transparent text-slate-12 dark:border-purpledark-6 dark:text-slatedark-12",
    },
    // violet
    {
      variant: "solid",
      colorScheme: "violet",
      className:
        "border-violet-9 bg-violet-9 text-slate-1 dark:border-violetdark-9 dark:bg-violetdark-9 dark:text-slatedark-1",
    },
    {
      variant: "subtle",
      colorScheme: "violet",
      className:
        "border-violet-6 bg-violet-3 text-slate-12 dark:border-violetdark-6 dark:bg-violetdark-3 dark:text-slatedark-12",
    },
    {
      variant: "outline",
      colorScheme: "violet",
      className: "border-violet-6 bg-transparent text-slate-12 dark:border-violetdark-6 dark:text-slatedark-12",
    },
    // indigo
    {
      variant: "solid",
      colorScheme: "indigo",
      className:
        "border-indigo-9 bg-indigo-9 text-slate-1 dark:border-indigodark-9 dark:bg-indigodark-9 dark:text-slatedark-1",
    },
    {
      variant: "subtle",
      colorScheme: "indigo",
      className:
        "border-indigo-6 bg-indigo-3 text-slate-12 dark:border-indigodark-6 dark:bg-indigodark-3 dark:text-slatedark-12",
    },
    {
      variant: "outline",
      colorScheme: "indigo",
      className: "border-indigo-6 bg-transparent text-slate-12 dark:border-indigodark-6 dark:text-slatedark-12",
    },
    // blue
    {
      variant: "solid",
      colorScheme: "blue",
      className: "border-blue-9 bg-blue-9 text-slate-1 dark:border-bluedark-9 dark:bg-bluedark-9 dark:text-slatedark-1",
    },
    {
      variant: "subtle",
      colorScheme: "blue",
      className:
        "border-blue-6 bg-blue-3 text-slate-12 dark:border-bluedark-6 dark:bg-bluedark-3 dark:text-slatedark-12",
    },
    {
      variant: "outline",
      colorScheme: "blue",
      className: "border-blue-6 bg-transparent text-slate-12 dark:border-bluedark-6 dark:text-slatedark-12",
    },
    // cyan
    {
      variant: "solid",
      colorScheme: "cyan",
      className: "border-cyan-9 bg-cyan-9 text-slate-1 dark:border-cyandark-9 dark:bg-cyandark-9 dark:text-slatedark-1",
    },
    {
      variant: "subtle",
      colorScheme: "cyan",
      className:
        "border-cyan-6 bg-cyan-3 text-slate-12 dark:border-cyandark-6 dark:bg-cyandark-3 dark:text-slatedark-12",
    },
    {
      variant: "outline",
      colorScheme: "cyan",
      className: "border-cyan-6 bg-transparent text-slate-12 dark:border-cyandark-6 dark:text-slatedark-12",
    },
    // teal
    {
      variant: "solid",
      colorScheme: "teal",
      className: "border-teal-9 bg-teal-9 text-slate-1 dark:border-tealdark-9 dark:bg-tealdark-9 dark:text-slatedark-1",
    },
    {
      variant: "subtle",
      colorScheme: "teal",
      className:
        "border-teal-6 bg-teal-3 text-slate-12 dark:border-tealdark-6 dark:bg-tealdark-3 dark:text-slatedark-12",
    },
    {
      variant: "outline",
      colorScheme: "teal",
      className: "border-teal-6 bg-transparent text-slate-12 dark:border-tealdark-6 dark:text-slatedark-12",
    },
    // green
    {
      variant: "solid",
      colorScheme: "green",
      className:
        "border-green-9 bg-green-9 text-slate-1 dark:border-greendark-9 dark:bg-greendark-9 dark:text-slatedark-1",
    },
    {
      variant: "subtle",
      colorScheme: "green",
      className:
        "border-green-6 bg-green-3 text-slate-12 dark:border-greendark-6 dark:bg-greendark-3 dark:text-slatedark-12",
    },
    {
      variant: "outline",
      colorScheme: "green",
      className: "border-green-6 bg-transparent text-slate-12 dark:border-greendark-6 dark:text-slatedark-12",
    },
    // grass
    {
      variant: "solid",
      colorScheme: "grass",
      className:
        "border-grass-9 bg-grass-9 text-slate-1 dark:border-grassdark-9 dark:bg-grassdark-9 dark:text-slatedark-1",
    },
    {
      variant: "subtle",
      colorScheme: "grass",
      className:
        "border-grass-6 bg-grass-3 text-slate-12 dark:border-grassdark-6 dark:bg-grassdark-3 dark:text-slatedark-12",
    },
    {
      variant: "outline",
      colorScheme: "grass",
      className: "border-grass-6 bg-transparent text-slate-12 dark:border-grassdark-6 dark:text-slatedark-12",
    },
    // brown
    {
      variant: "solid",
      colorScheme: "brown",
      className:
        "border-brown-9 bg-brown-9 text-slate-1 dark:border-browndark-9 dark:bg-browndark-9 dark:text-slatedark-1",
    },
    {
      variant: "subtle",
      colorScheme: "brown",
      className:
        "border-brown-6 bg-brown-3 text-slate-12 dark:border-browndark-6 dark:bg-browndark-3 dark:text-slatedark-12",
    },
    {
      variant: "outline",
      colorScheme: "brown",
      className: "border-brown-6 bg-transparent text-slate-12 dark:border-browndark-6 dark:text-slatedark-12",
    },
    // orange
    {
      variant: "solid",
      colorScheme: "orange",
      className:
        "border-orange-9 bg-orange-9 text-slate-1 dark:border-orangedark-9 dark:bg-orangedark-9 dark:text-slatedark-1",
    },
    {
      variant: "subtle",
      colorScheme: "orange",
      className:
        "border-orange-6 bg-orange-3 text-slate-12 dark:border-orangedark-6 dark:bg-orangedark-3 dark:text-slatedark-12",
    },
    {
      variant: "outline",
      colorScheme: "orange",
      className: "border-orange-6 bg-transparent text-slate-12 dark:border-orangedark-6 dark:text-slatedark-12",
    },
    // sky
    {
      variant: "solid",
      colorScheme: "sky",
      className: "border-sky-9 bg-sky-9 text-slate-1 dark:border-skydark-9 dark:bg-skydark-9 dark:text-slatedark-1",
    },
    {
      variant: "subtle",
      colorScheme: "sky",
      className: "border-sky-6 bg-sky-3 text-slate-12 dark:border-skydark-6 dark:bg-skydark-3 dark:text-slatedark-12",
    },
    {
      variant: "outline",
      colorScheme: "sky",
      className: "border-sky-6 bg-transparent text-slate-12 dark:border-skydark-6 dark:text-slatedark-12",
    },
    // mint
    {
      variant: "solid",
      colorScheme: "mint",
      className: "border-mint-9 bg-mint-9 text-slate-1 dark:border-mintdark-9 dark:bg-mintdark-9 dark:text-slatedark-1",
    },
    {
      variant: "subtle",
      colorScheme: "mint",
      className:
        "border-mint-6 bg-mint-3 text-slate-12 dark:border-mintdark-6 dark:bg-mintdark-3 dark:text-slatedark-12",
    },
    {
      variant: "outline",
      colorScheme: "mint",
      className: "border-mint-6 bg-transparent text-slate-12 dark:border-mintdark-6 dark:text-slatedark-12",
    },
    // lime
    {
      variant: "solid",
      colorScheme: "lime",
      className: "border-lime-9 bg-lime-9 text-slate-1 dark:border-limedark-9 dark:bg-limedark-9 dark:text-slatedark-1",
    },
    {
      variant: "subtle",
      colorScheme: "lime",
      className:
        "border-lime-6 bg-lime-3 text-slate-12 dark:border-limedark-6 dark:bg-limedark-3 dark:text-slatedark-12",
    },
    {
      variant: "outline",
      colorScheme: "lime",
      className: "border-lime-6 bg-transparent text-slate-12 dark:border-limedark-6 dark:text-slatedark-12",
    },
    // yellow
    {
      variant: "solid",
      colorScheme: "yellow",
      className:
        "border-yellow-9 bg-yellow-9 text-slate-1 dark:border-yellowdark-9 dark:bg-yellowdark-9 dark:text-slatedark-1",
    },
    {
      variant: "subtle",
      colorScheme: "yellow",
      className:
        "border-yellow-6 bg-yellow-3 text-slate-12 dark:border-yellowdark-6 dark:bg-yellowdark-3 dark:text-slatedark-12",
    },
    {
      variant: "outline",
      colorScheme: "yellow",
      className: "border-yellow-6 bg-transparent text-slate-12 dark:border-yellowdark-6 dark:text-slatedark-12",
    },
    // amber
    {
      variant: "solid",
      colorScheme: "amber",
      className:
        "border-amber-9 bg-amber-9 text-slate-1 dark:border-amberdark-9 dark:bg-amberdark-9 dark:text-slatedark-1",
    },
    {
      variant: "subtle",
      colorScheme: "amber",
      className:
        "border-amber-6 bg-amber-3 text-slate-12 dark:border-amberdark-6 dark:bg-amberdark-3 dark:text-slatedark-12",
    },
    {
      variant: "outline",
      colorScheme: "amber",
      className: "border-amber-6 bg-transparent text-slate-12 dark:border-amberdark-6 dark:text-slatedark-12",
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
