#!/usr/bin/env node
import "source-map-support/register";
import { App } from "aws-cdk-lib";
import { AppStack } from "../lib/app/app-stack";
import { ApiStack } from "../lib/api/api-stack";
import { AuthStack } from "../lib/auth/auth-stack";
import * as Yup from "yup";

//////////////////////////////////////////////////////////////////////////////
// Check for the required environment variables
//////////////////////////////////////////////////////////////////////////////
// ensure the account is defined
if (!process.env.CDK_DEFAULT_ACCOUNT)
  throw new Error("CDK_DEFAULT_ACCOUNT is not defined and is required.");

// ensure the NODE_ENV is either "PROD" or "DEV"
let envSchema = Yup.string().oneOf(["PROD", "DEV"]).required();
if (envSchema.isValidSync(process.env.NODE_ENV))
  throw new Error(
    `NODE_ENV is ${process.env.NODE_ENV} but should be either "PROD" or "DEV"`
  );

//////////////////////////////////////////////////////////////////////////////
// Define App Constants
//////////////////////////////////////////////////////////////////////////////
// define environments
const Env = {
  PROD: { account: "561720044356", region: "us-east-1" },
  DEV: { account: process.env.CDK_DEFAULT_ACCOUNT, region: "us-east-1" },
};

//////////////////////////////////////////////////////////////////////////////
// Create the Stacks
//////////////////////////////////////////////////////////////////////////////
// create the app
const app = new App();
const appStack = new AppStack(app, "AppStack", {
  env: Env[process.env.NODE_ENV],
});

// create the api
new ApiStack(app, "ApiStack", {
  env: Env[process.env.NODE_ENV],
  certificate: appStack.certificate,
});

// create the auth
new AuthStack(app, "AuthStack", { env: Env[process.env.NODE_ENV] });
