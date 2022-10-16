import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Handler } from "@serverless-stack/node/context";
import { useSession } from "@serverless-stack/node/auth";

export const handler: APIGatewayProxyHandlerV2 = Handler("api", async (event) => {
  const session = useSession();

  console.log(session);

  // respond 401 if user not logged in
  if (session.type !== "user") return { statusCode: 401 };

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello, ${session.properties.name}. You have the roles: ${session.properties.roles}`,
  };
});
