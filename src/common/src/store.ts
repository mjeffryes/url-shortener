import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

export interface UrlRecord {
  shortUrlSlug: string;
  longUrl: string;
}

export interface Store {
  // store the UrlRecord
  put: (data: UrlRecord) => Promise<boolean>;
  // retrieve the UrlRecord for this slug
  get: (slug: string) => Promise<UrlRecord | undefined>;
}

export function inMemoryStore(records: Record<string, UrlRecord> = {}): Store {
  return {
    get: async (slug: string) => {
      return records[slug];
    },
    put: async (data: UrlRecord) => {
      const { shortUrlSlug } = data;
      console.log(shortUrlSlug);
      if (records[shortUrlSlug] !== undefined) {
        console.log("A");
        return false;
      }
      records[shortUrlSlug] = data;
      return true;
    },
  };
}

export function dynamoDbStore(tableName: string): Store {
  const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

  return {
    get: async (shortUrlSlug: string) => {
      const command = new GetCommand({
        TableName: tableName,
        Key: { shortUrlSlug },
      });
      console.log(command);

      const result = await dynamoDb.send(command);
      if (!result.Item) {
        return undefined;
      }

      return result.Item as UrlRecord;
    },
    put: async (item: UrlRecord) => {
      const command = new PutCommand({
        TableName: tableName,
        Item: item,
        ConditionExpression: "attribute_not_exists(shortUrlSlug)",
      });

      console.log(command);

      const result = await dynamoDb.send(command).catch((error) => {
        if (error.name === "ConditionalCheckFailedException") {
          // there's already something stored here.
          return false;
        }

        console.error(JSON.stringify(error));
        throw error;
      });

      console.log(JSON.stringify(result));
      return true;
    },
  };
}
