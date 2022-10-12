import { RemixSite, StackContext } from "@serverless-stack/resources";

export function WebStack({ stack }: StackContext) {
  // Create a Remix site
  const site = new RemixSite(stack, "web", {
    path: "web/",
    environment: { REGION: stack.region },
  });

  stack.addOutputs({
    SiteURL: site.url,
  });
}
