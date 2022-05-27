import { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const githubSignin: APIGatewayProxyHandlerV2<{ message: string }> =
  async (event) => {
    console.log(event);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Hi from '/auth/signin/github'!" }),
    };
  };
