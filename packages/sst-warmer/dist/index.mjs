import { RemixSite, Stack } from "sst/constructs";
import { Function as CdkFunction, Code, Runtime } from "aws-cdk-lib/aws-lambda";
import { Duration as CdkDuration, CustomResource } from "aws-cdk-lib";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import path from "path";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { Effect, Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
export class WarmRemixSite extends RemixSite {
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
        const warmer = new CdkFunction(this, "WarmerFunction", {
            description: "Server handler warmer",
            code: Code.fromAsset(path.join(__dirname, "../support/warmer-function")),
            runtime: Runtime.NODEJS_18_X,
            handler: "index.handler",
            timeout: CdkDuration.minutes(15),
            memorySize: 1024,
            environment: {
                FUNCTION_NAME: this.serverLambdaForRegional.functionName,
                CONCURRENCY: warm.toString(),
            },
        });
        this.serverLambdaForRegional.grantInvoke(warmer);
        // create cron job
        new Rule(this, "WarmerRule", {
            schedule: Schedule.rate(CdkDuration.minutes(5)),
            targets: [new LambdaFunction(warmer, { retryAttempts: 0 })],
        });
        // create custom resource to prewarm on deploy
        const stack = Stack.of(this);
        const policy = new Policy(this, "PrewarmerPolicy", {
            statements: [
                new PolicyStatement({
                    effect: Effect.ALLOW,
                    actions: ["lambda:InvokeFunction"],
                    resources: [warmer.functionArn],
                }),
            ],
        });
        stack.customResourceHandler.role?.attachInlinePolicy(policy);
        const resource = new CustomResource(this, "Prewarmer", {
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
