"use strict";

import { handleShortenRequest } from "../src/impl";
import { inMemoryStore } from "@url-shortener/common/src/store";

describe("handleShortenRequest", () => {
  const inMemStore = inMemoryStore();
  const invalidInputResult = {
    statusCode: 400,
    data: { message: "Invalid Url" },
  };

  test("null body", async () => {
    const result = await handleShortenRequest(inMemStore, null);
    expect(result).toEqual(invalidInputResult);
  });

  test("invalid json body", async () => {
    const body = '{  "url": ';
    const result = await handleShortenRequest(inMemStore, body);
    expect(result).toEqual(invalidInputResult);
  });

  test("no url in body", async () => {
    const body = JSON.stringify({ foo: "bar" });
    const result = await handleShortenRequest(inMemStore, body);
    expect(result).toEqual(invalidInputResult);
  });

  test("valid Url", async () => {
    const body = JSON.stringify({ url: "https://twitter.com" });
    const { statusCode, data } = await handleShortenRequest(inMemStore, body);
    expect(statusCode).toEqual(200);
    expect(data).toHaveProperty("shortUrl");
    const { shortUrl } = data;
    expect(shortUrl).toMatch(/^https:\/\/example\.com\/[-_a-zA-Z0-9]{5,6}$/);
  });

  test("same Url", async () => {
    const body = JSON.stringify({ url: "https://twitter.com" });
    const { data: data1 } = await handleShortenRequest(inMemStore, body);
    const { statusCode, data: data2 } = await handleShortenRequest(
      inMemStore,
      body
    );
    expect(statusCode).toEqual(200);
    expect(data2).toHaveProperty("shortUrl", data1.shortUrl);
  });

  test("hash collision", async () => {
    const body = JSON.stringify({ url: "https://twitter.com" });
    const { data: data1 } = await handleShortenRequest(inMemStore, body);

    // force a different target url to be stored for this slug
    const shortUrl1 = data1.shortUrl as string;
    const shortUrlSlug = shortUrl1.slice(shortUrl1.lastIndexOf("/") + 1);
    const records = {};
    records[shortUrlSlug] = { shortUrlSlug, longUrl: "https://google.com" };
    const occupiedStore = inMemoryStore(records);

    // check that we pick a new (longer) hash
    const { statusCode, data: data2 } = await handleShortenRequest(
      occupiedStore,
      body
    );
    expect(statusCode).toEqual(200);
    expect(data2).toHaveProperty("shortUrl");
    const { shortUrl } = data2;
    expect(shortUrl).toMatch(/^https:\/\/example\.com\/[-_a-zA-Z0-9]{11,12}$/);
  });
});
