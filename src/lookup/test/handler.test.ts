"use strict";

import { handleLookupRequest } from "../src/impl";
import { inMemoryStore } from "@url-shortener/common/src/store";

describe("handleLookupRequest", () => {
  const inMemStore = inMemoryStore();
  const notFoundResult = {
    statusCode: 404,
    headers: { "Content-Type": "application/json" },
    body: '{"message":"Not Found"}',
  };

  test("null shortUrlSlug", async () => {
    expect(await handleLookupRequest(inMemStore, null)).toEqual(notFoundResult);
  });

  test("invalid shortUrlSlug", async () => {
    const shortUrlSlug =
      "3498789gnw89ynwv8w9vhwn9hg7owmhgwhcg709wcg80wey n78x97qy38xo9q3y xru";
    expect(await handleLookupRequest(inMemStore, shortUrlSlug)).toEqual(
      notFoundResult
    );
  });

  test("not stored", async () => {
    const shortUrlSlug = "78x97q";
    expect(await handleLookupRequest(inMemStore, shortUrlSlug)).toEqual(
      notFoundResult
    );
  });

  test("found", async () => {
    const shortUrlSlug = "78x97q";
    const longUrl = "https://google.com";
    inMemStore.put({ shortUrlSlug, longUrl });
    expect(await handleLookupRequest(inMemStore, shortUrlSlug)).toEqual({
      statusCode: 301,
      headers: { Location: longUrl },
      body: "",
    });
  });
});
