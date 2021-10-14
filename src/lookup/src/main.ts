import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";

import { dynamoDbStore } from "@url-shortener/common/src/store";
import { exprThrow } from "@url-shortener/common/src/utils";

import { handleLookupRequest } from "./impl";

const store = dynamoDbStore(
  process.env.URLS_TABLE ?? exprThrow(Error("Missing table name"))
);

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
) => {
  console.log(event);
  const { pathParameters } = event;
  const { shorturl } = pathParameters ?? { shorturl: null };

  return await handleLookupRequest(store, shorturl ?? null);
};
