import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";

/**
 * The app stack contains all top-level app configuration and resources. This
 * stack should contain resources that should only be created once and apply
 * across multiple stack, but wouldn't necessarily fit in with any particular
 * stack.
 */
export class AppStack extends Stack {
  public certificate: Certificate;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // (1) Create the SSL/TLS certificate for the domain names.
    //
    // Note! The DNS records for your domain name will need to be configured
    // manually. Follow the instructions here for more details:
    // https://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html
    this.certificate = new Certificate(this, "SSLTLSCertificate", {
      domainName: "spencerduball.com",
      subjectAlternativeNames: ["*.spencerduball.com"],
      validation: CertificateValidation.fromDns(),
    });
  }
}
