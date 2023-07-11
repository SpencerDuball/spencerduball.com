"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarmRemixSite = void 0;
const constructs_1 = require("sst/constructs");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_events_1 = require("aws-cdk-lib/aws-events");
const path_1 = __importDefault(require("path"));
const aws_events_targets_1 = require("aws-cdk-lib/aws-events-targets");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
class WarmRemixSite extends constructs_1.RemixSite {
    constructor(scope, id, { warm, ...props }) {
        super(scope, id, props);
        this.createWarmer();
    }
    createWarmer() {
        const [warm, edge] = [this.warm, this.props.edge];
        if (!warm)
            return;
        if (warm && edge)
            throw new Error(`Warming is currently supported only for the regional mode.`);
        if (!this.serverLambdaForRegional)
            return;
        // create warmer function
        const warmer = new aws_lambda_1.Function(this, "WarmerFunction", {
            description: "Server handler warmer",
            code: aws_lambda_1.Code.fromAsset(path_1.default.join(__dirname, "../support/warmer-function")),
            runtime: aws_lambda_1.Runtime.NODEJS_18_X,
            handler: "index.handler",
            timeout: aws_cdk_lib_1.Duration.minutes(15),
            memorySize: 1024,
            environment: {
                FUNCTION_NAME: this.serverLambdaForRegional.functionName,
                CONCURRENCY: warm.toString(),
            },
        });
        this.serverLambdaForRegional.grantInvoke(warmer);
        // create cron job
        new aws_events_1.Rule(this, "WarmerRule", {
            schedule: aws_events_1.Schedule.rate(aws_cdk_lib_1.Duration.minutes(5)),
            targets: [new aws_events_targets_1.LambdaFunction(warmer, { retryAttempts: 0 })],
        });
        // create custom resource to prewarm on deploy
        const stack = constructs_1.Stack.of(this);
        const policy = new aws_iam_1.Policy(this, "PrewarmerPolicy", {
            statements: [
                new aws_iam_1.PolicyStatement({
                    effect: aws_iam_1.Effect.ALLOW,
                    actions: ["lambda:InvokeFunction"],
                    resources: [warmer.functionArn],
                }),
            ],
        });
        stack.customResourceHandler.role?.attachInlinePolicy(policy);
        const resource = new aws_cdk_lib_1.CustomResource(this, "Prewarmer", {
            serviceToken: stack.customResourceHandler.functionArn,
            resourceType: "Custom::FunctionInvoker",
            properties: {
                version: Date.now().toString(),
                functionName: warmer.functionName,
            },
        });
        resource.node.addDependency(policy);
    }
}
exports.WarmRemixSite = WarmRemixSite;
