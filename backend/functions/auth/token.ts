import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import jwt from "jsonwebtoken";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const a = jwt.sign(JSON.stringify({ username: "sup" }), "secret", {
    algorithm: "RS256",
    keyid: "sup",
  });
  console.log("Encoded: " + a);
  console.log("Decoded: " + JSON.stringify(jwt.decode(a)));

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello, Wrold! Your request was received at ${event.requestContext.time}.`,
  };
};
