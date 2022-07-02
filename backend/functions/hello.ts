import { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  switch (event.requestContext.http.method) {
    case "GET": {
      const res = { message: "Yay a solid GET request!" };
      return { statusCode: 200, body: JSON.stringify(res) };
    }
    case "POST": {
      const res = { message: "Yay a solid POST request!" };
      return { statusCode: 200, body: JSON.stringify(res) };
    }
    default: {
      const res = { message: "Unsupported HTTP method." };
      return { statusCode: 400, body: JSON.stringify(res) };
    }
  }
};
