import { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const githubOAuthCallback: APIGatewayProxyHandlerV2<{
  message: string;
}> = async (event) => {
  console.log(event);
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hi from '/auth/github/callback'!",
    }),
  };
};
