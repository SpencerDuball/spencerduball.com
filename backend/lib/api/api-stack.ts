import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { CfnGraphQLApi, CfnGraphQLSchema } from "aws-cdk-lib/aws-appsync";
import { Asset } from "aws-cdk-lib/aws-s3-assets";
import path from "path";

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create the API
    const api = new CfnGraphQLApi(this, "Api", {
      authenticationType: "AWS_IAM",
      name: "Api",
    });

    // Upload the schema to S3
    const apiSchemaFile = new Asset(this, "ApiSchemaFile", {
      path: path.join(__dirname, "schema.gql"),
    });

    // Create the API schema
    const schema = new CfnGraphQLSchema(this, "ApiSchema", {
      apiId: api.attrApiId,
      definitionS3Location: apiSchemaFile.s3ObjectUrl,
    });
  }
}
