import { RemixSite, StackContext, use, App } from "@serverless-stack/resources";
import { CloudStack } from "./cloud-stack";

const getParamterStorePath = (app: App, name: string) => `/sst/${app.name}/${app.stage}/secrets/${name}`;

export function WebStack({ stack, app }: StackContext) {
  const { webProxy, api, auth } = use(CloudStack);

  // create a Remix site
  const site = new RemixSite(stack, "web", {
    path: "web/",
    edge: false,
    environment: {
      REGION: stack.region,
      API_URL: api.url,
    },
  });

  // add a proxy+
  webProxy.addRoutes(stack, {
    "ANY /{proxy+}": { type: "url", url: `${site.url}/{proxy}` },
  });

  // export the site url
  stack.addOutputs({ SiteURL: webProxy.url });
}
