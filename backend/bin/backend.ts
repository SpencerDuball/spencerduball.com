#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ApiStack } from "../lib/api/api-stack";
import { AuthStack } from "../lib/auth/auth-stack";

// define environments
const DefaultEnv = { account: "561720044356", region: "us-east-1" } as const;

const app = new cdk.App();
new AuthStack(app, "AuthStack", { env: DefaultEnv });
new ApiStack(app, "ApiStack", { env: DefaultEnv });
