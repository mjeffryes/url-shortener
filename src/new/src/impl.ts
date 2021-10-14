import murmurhash from "murmurhash";
import { Buffer } from "buffer";

import { Store } from "@url-shortener/common/src/store";

interface Result {
  statusCode: number;
  data: Record<string, unknown>;
}

// visible-for-testing
// Accept requests with a URL to shorten, compute a short url,
// store the long url and return the short url
export async function handleShortenRequest(
  store: Store,
  body: string | null,
  domainName = "example.com"
): Promise<Result> {
  const longUrl = body ? getLongUrl(body) : null;
  if (longUrl == null) {
    return {
      statusCode: 400,
      data: { message: "Invalid Url" },
    };
  }

  const shortUrlSlug = await shortenAndStore(store, longUrl);

  return {
    statusCode: 200,
    data: { shortUrl: `https://${domainName}/${shortUrlSlug}` },
  };
}

function getLongUrl(body: string): string | null {
  try {
    const { url } = JSON.parse(body);

    //TODO: We might want to check that it's not too long and is actually a url to prevent abuse

    return url;
  } catch {
    return null;
  }
}

async function shortenAndStore(store: Store, longUrl: string): Promise<string> {
  let shortUrlSlug = "";
  // dynamically extend the slug up to 128 bits until we find on that's unique
  for (let i = 0; i < 4; i++) {
    shortUrlSlug += mkSlug(longUrl + i);
    if (await store.put({ shortUrlSlug, longUrl })) {
      // success
      return shortUrlSlug;
    }
    // slug has been used,
    // check if the UrlRecord in the store already points to this longUrl
    const stored = await store.get(shortUrlSlug);
    if (stored?.longUrl === longUrl) {
      return shortUrlSlug;
    }

    // occupied by another url, will need to keep looking
  }
  throw new Error("Could not generate a unique slug for url: " + longUrl);
}

function mkSlug(str: string): string {
  const hash = murmurhash.v3(str);
  const buf = Buffer.allocUnsafe(4);

  buf.writeUInt32BE(hash, 0);
  const b64 = buf.toString("base64");
  return b64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
