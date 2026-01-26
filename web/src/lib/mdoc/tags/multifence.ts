import { type Schema } from "@markdoc/markdoc";

export const multifence: Schema = {
  render: "MultiFence",
  children: ["fencefile"],
};

export const fencefile: Schema = {
  render: "FenceFile",
  children: ["fence"],
};
