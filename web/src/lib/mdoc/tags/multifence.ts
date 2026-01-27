import { type Schema } from "@markdoc/markdoc";

export const multifence: Schema = {
  render: "MultiFence",
  children: ["fencefile"],
  attributes: {
    scrollarea: { type: String, required: false },
  },
};

export const fencefile: Schema = {
  render: "FenceFile",
  children: ["fence"],
  attributes: {
    value: { type: String, required: true, default: false },
  },
};
