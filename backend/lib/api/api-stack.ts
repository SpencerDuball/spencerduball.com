import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import {
  HttpApi,
  DomainName,
  CorsHttpMethod,
  HttpStage,
} from "@aws-cdk/aws-apigatewayv2-alpha";

export interface ApiStackProps extends StackProps {
  certificate: Certificate;
}

export class ApiStack extends Stack {
  public httpApi: HttpApi;

  constructor(scope: Construct, id: string, props?: ApiStackProps) {
    super(scope, id, props);

    // create the domain name
    const domainName = new DomainName(this, "HttpApiDomainName", {
      domainName: "api.spencerduball.com",
      certificate: props.certificate,
    });

    // create the api
    this.httpApi = new HttpApi(this, "HttpApi", {
      apiName: "Api",
      createDefaultStage: false,
      corsPreflight: {
        allowOrigins: ["https://spencerduball.com"],
        allowMethods: [CorsHttpMethod.ANY],
      },
    });

    // create stage
    if (process.env.NODE_ENV === "PROD") {
      // maps -> https://api.my-domain.com/dev
      new HttpStage(this, "HttpApiDevStage", {
        httpApi: this.httpApi,
        autoDeploy: true,
        domainMapping: {
          domainName,
          mappingKey: "dev",
        },
      });
    } else if (process.env.NOD_ENV === "DEV") {
      // maps -> https://api.my-domain.com
      new HttpStage(this, "HttpApiProdStage", {
        httpApi: this.httpApi,
        autoDeploy: true,
      });
    }
  }
}
