import { defineConfig } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";

import amber from "@park-ui/panda-preset/colors/amber";
import blue from "@park-ui/panda-preset/colors/blue";
import bronze from "@park-ui/panda-preset/colors/bronze";
import brown from "@park-ui/panda-preset/colors/brown";
import crimson from "@park-ui/panda-preset/colors/crimson";
import cyan from "@park-ui/panda-preset/colors/cyan";
import gold from "@park-ui/panda-preset/colors/gold";
import grass from "@park-ui/panda-preset/colors/grass";
import green from "@park-ui/panda-preset/colors/green";
import indigo from "@park-ui/panda-preset/colors/indigo";
import iris from "@park-ui/panda-preset/colors/iris";
import jade from "@park-ui/panda-preset/colors/jade";
import lime from "@park-ui/panda-preset/colors/lime";
import mauve from "@park-ui/panda-preset/colors/mauve";
import mint from "@park-ui/panda-preset/colors/mint";
import neutral from "@park-ui/panda-preset/colors/neutral";
import olive from "@park-ui/panda-preset/colors/olive";
import orange from "@park-ui/panda-preset/colors/orange";
import pink from "@park-ui/panda-preset/colors/pink";
import plum from "@park-ui/panda-preset/colors/plum";
import purple from "@park-ui/panda-preset/colors/purple";
import red from "@park-ui/panda-preset/colors/red";
import ruby from "@park-ui/panda-preset/colors/ruby";
import sage from "@park-ui/panda-preset/colors/sage";
import sand from "@park-ui/panda-preset/colors/sand";
import sky from "@park-ui/panda-preset/colors/sky";
import slate from "@park-ui/panda-preset/colors/slate";
import teal from "@park-ui/panda-preset/colors/teal";
import tomato from "@park-ui/panda-preset/colors/tomato";
import violet from "@park-ui/panda-preset/colors/violet";
import yellow from "@park-ui/panda-preset/colors/yellow";

const colors = [
  amber,
  blue,
  bronze,
  brown,
  crimson,
  cyan,
  gold,
  grass,
  green,
  indigo,
  iris,
  jade,
  lime,
  mauve,
  mint,
  neutral,
  olive,
  orange,
  pink,
  plum,
  purple,
  red,
  ruby,
  sage,
  sand,
  sky,
  slate,
  teal,
  tomato,
  violet,
  yellow,
];
const semanticColorTokens = colors
  .map((color) => ({ [color.name]: color.semanticTokens }))
  .reduce((acc, val) => ({ ...acc, ...val }), {});
const colorTokens = colors
  .map((color) => ({ [color.name]: color.tokens }))
  .reduce((acc, val) => ({ ...acc, ...val }), {});

export const containerSizes = {
  xs: "320px",
  sm: "384px",
  md: "448px",
  lg: "512px",
  xl: "576px",
  "2xl": "672px",
  "3xl": "768px",
  "4xl": "896px",
  "5xl": "1024px",
  "6xl": "1152px",
  "7xl": "1280px",
  "8xl": "1440px",
};

export default defineConfig({
  preflight: true,
  presets: [createPreset({ accentColor: neutral, grayColor: slate, radius: "sm" })],
  include: ["./app/**/*.{js,jsx,ts,tsx,vue}"],
  jsxFramework: "react", // or 'solid' or 'vue'
  outdir: "styled-system",
  globalCss: { html: { fontFamily: "inter" } },
  theme: {
    extend: {
      containerSizes,
      semanticTokens: {
        colors: semanticColorTokens,
      },
      tokens: {
        fonts: {
          inter: { value: ["'Inter Variable'", "sans-serif"] },
        },
        colors: colorTokens,
      },
    },
  },
});
