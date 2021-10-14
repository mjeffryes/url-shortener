export interface UrlRecord {
  shortUrlSlug: string;
  longUrl: string;
}

export interface Store {
  // Create the record in the store
  // Returns true if the record was created, false if a record for that shortUrlSlug already exists
  create: (data: UrlRecord) => boolean;
  put: (data: UrlRecord) => void;
  get: (slug: string) => UrlRecord | undefined;
}

export function inMemoryStore(): Store {
  const records: Record<string, UrlRecord> = {};

  return {
    get: (slug: string) => {
      return records[slug];
    },
    put: (data: UrlRecord) => {
      const { shortUrlSlug } = data;
      records[shortUrlSlug] = data;
    },
    create: (data: UrlRecord) => {
      const { shortUrlSlug } = data;
      const current = records[shortUrlSlug];
      if (current === undefined) {
        records[shortUrlSlug] = data;
        return true;
      } else if (current.longUrl == data.longUrl) {
        return true; // Already exists
      } else {
        return false;
      }
    },
  };
}
