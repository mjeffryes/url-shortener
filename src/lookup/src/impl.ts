import { APIGatewayProxyResult } from "aws-lambda";

import { Store } from "@url-shortener/common/src/store";

// visible-for-testing
// Accept requests with a slug to look up, return the long url associated with that slug
export async function handleLookupRequest(
  store: Store,
  shortUrlSlug: string | null
): Promise<APIGatewayProxyResult> {
  if (shortUrlSlug == null || shortUrlSlug.length > 24) {
    return notFound;
  }

  const urlRecord = await store.get(shortUrlSlug);
  if (urlRecord === undefined) {
    return notFound;
  }

  return {
    statusCode: 301,
    headers: {
      Location: urlRecord.longUrl,
    },
    body: "",
  };
}

const notFound: APIGatewayProxyResult = {
  statusCode: 404,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ message: "Not Found" }),
};
