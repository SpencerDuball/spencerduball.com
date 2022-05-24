const withMarkdoc = require("@markdoc/next.js");
const { withContentlayer } = require("next-contentlayer");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withContentlayer(
  withMarkdoc(nextConfig)({
    pageExtensions: ["tsx", "md", "mdoc"],
  })
);
