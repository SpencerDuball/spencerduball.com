import { Stack } from "@serverless-stack/resources";
import { Construct } from "constructs";
import ms from "ms";

function seconds(milliseconds: number) {
  return milliseconds / 1000;
}

export interface UserPoolProps {
  /** The refresh token validity duration in seconds. */
  refreshTokenDuration?: number;
  /** The access token validity duration in seconds. */
  accessTokenDuration?: number;
}

export class UserPool extends Construct {
  public refreshTokenDuration: number;
  public accessTokenDuration: number;

  constructor(
    scope: Stack,
    id: string,
    props: UserPoolProps = {
      refreshTokenDuration: seconds(ms("7 days")),
      accessTokenDuration: seconds(ms("1 hour")),
    }
  ) {
    super(scope, id);

    // set the token durations
    this.refreshTokenDuration = props.refreshTokenDuration;
    this.accessTokenDuration = props.accessTokenDuration;
  }
}
