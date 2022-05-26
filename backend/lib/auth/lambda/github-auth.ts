import { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const githubAuthLink: APIGatewayProxyHandlerV2<{ message: string }> =
  async (event) => {
    console.log(event);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Hello there!" }),
    };
  };
