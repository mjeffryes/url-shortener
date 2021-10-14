import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";

import { dynamoDbStore } from "@url-shortener/common/src/store";
import { exprThrow } from "@url-shortener/common/src/utils";

import { handleShortenRequest } from "./impl";

const store = dynamoDbStore(
  process.env.URLS_TABLE ?? exprThrow(Error("Missing table name"))
);

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
) => {
  console.log(event);
  const { body, requestContext } = event;
  const { domainName } = requestContext;
  const { statusCode, data } = await handleShortenRequest(
    store,
    body,
    domainName
  );
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
};
