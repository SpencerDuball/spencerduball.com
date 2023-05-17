import { Table, Entity } from "dynamodb-toolbox";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";
import ms from "ms";
import { randomBytes } from "crypto";

/* ------------------------------------------------------------------------------------------------------------
 * Session
 * ------------------------------------------------------------------------------------------------------------ */
export const SessionSchema = {
  name: "Session",
  attributes: {
    id: { type: "string", default: () => randomBytes(16).toString("hex") },
    pk: { partitionKey: true, type: "string", default: (data: { id: string }) => `session#${data.id}` },
    sk: { sortKey: true, type: "string", default: (data: { id: string }) => `session#${data.id}` },
    gsi1pk: { type: "string", dependsOn: "userId", default: (data: { userId: string }) => `user#${data.userId}` },
    gsi1sk: { type: "string", dependsOn: "id", default: (data: { pk: string }) => data.pk },
    userId: { type: "number", required: true },
    username: { type: "string", required: true },
    name: { type: "string", required: true },
    avatarUrl: { type: "string" },
    githubUrl: { type: "string", required: true },
    roles: { type: "list" },
    ttl: { type: "number", required: true },
  },
} as const;

export const ZSession = z.object({
  id: z.string(),
  pk: z.string(),
  sk: z.string(),
  userId: z.number(),
  username: z.string(),
  name: z.string(),
  avatarUrl: z.string().optional(),
  githubUrl: z.string(),
  roles: z.preprocess((val) => (val ? val : []), z.string().array()),
  ttl: z.number(),
  modified: z.string(),
  created: z.string(),
  entity: z.string(),
});

export type SessionType = ReturnType<typeof ZSession.parse>;

/* ------------------------------------------------------------------------------------------------------------
 * OAuthStateCode
 * ------------------------------------------------------------------------------------------------------------ */
export const ZCode = z.object({ id: z.string(), redirectUri: z.string().optional() });

export const OAuthStateCodeSchema = {
  name: "OAuthStateCode",
  attributes: {
    id: { type: "string", default: () => randomBytes(16).toString("hex") },
    pk: { partitionKey: true, type: "string", default: (data: { id: string }) => `oauth_state_code#${data.id}` },
    sk: { sortKey: true, type: "string", default: (data: { id: string }) => `oauth_state_code#${data.id}` },
    redirectUri: { type: "string" },
    code: {
      type: "string",
      dependsOn: ["id", "redirectUri"],
      default: (data: { id: string; redirectUri?: string }) => JSON.stringify(ZCode.parse(data)),
    },
    ttl: { type: "number", default: () => Math.round((new Date().getTime() + ms("15m")) / 1000) },
  },
} as const;

export const ZOAuthStateCode = z.object({
  id: z.string(),
  pk: z.string(),
  sk: z.string(),
  redirectUri: z.string().optional(),
  code: z.string(),
  ttl: z.number(),
  modified: z.string(),
  created: z.string(),
  entity: z.string(),
});

export type OAuthStateCodeType = ReturnType<typeof ZOAuthStateCode.parse>;

/* ------------------------------------------------------------------------------------------------------------
 * OAuthMock
 * ------------------------------------------------------------------------------------------------------------ */
export const OAuthMockSchema = {
  name: "OAuthMock",
  attributes: {
    id: { type: "string", required: true },
    pk: { partitionKey: true, type: "string", default: (data: { id: string }) => `oauth_mock#${data.id}` },
    sk: { sortKey: true, type: "string", default: (data: { id: string }) => `oauth_mock#${data.id}` },
    userId: { type: "number", required: true },
    ttl: { type: "number", default: () => Math.round((new Date().getTime() + ms("15m")) / 1000) },
  },
} as const;

export const ZOAuthMock = z.object({
  id: z.string(),
  pk: z.string(),
  sk: z.string(),
  userId: z.number(),
  ttl: z.number(),
  modified: z.string(),
  created: z.string(),
  entity: z.string(),
});

export type OAuthMock = ReturnType<typeof ZOAuthMock.parse>;

/* ------------------------------------------------------------------------------------------------------------
 * Ddb
 * ------------------------------------------------------------------------------------------------------------ */

const marshallOptions = {
  // Whether to automatically convert empty strings, blobs, and sets to `null`.
  convertEmptyValues: false, // if not false explicitly, we set it to true.
  // Whether to remove undefined values while marshalling.
  removeUndefinedValues: false, // false, by default.
  // Whether to convert typeof object to map attribute.
  convertClassInstanceToMap: false, // false, by default.
};

const unmarshallOptions = {
  // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
  // NOTE: this is required to be true in order to use the bigint data type.
  wrapNumbers: false, // false, by default.
};

const translateConfig = { marshallOptions, unmarshallOptions };

export class Ddb {
  table: Table<string, "pk", "sk">;

  entities = {
    oauthStateCode: new Entity(OAuthStateCodeSchema),
    session: new Entity(SessionSchema),
    oauthMock: new Entity(OAuthMockSchema),
  };

  constructor(props: { tableName: string; client: DynamoDBClient }) {
    this.table = new Table({
      name: props.tableName,
      partitionKey: "pk",
      sortKey: "sk",
      // gsi1 is used to search for all session of a user.
      // @example { gsi1pk: "user#<userId>", gsi1sk: "session#<sessionId>" }
      indexes: { gsi1: { partitionKey: "gsi1pk", sortKey: "gsi1sk" } },
      DocumentClient: DynamoDBDocumentClient.from(props.client, translateConfig),
    });

    // assign the table to all entities
    for (let entity of Object.values(this.entities)) {
      entity.table = this.table as any;
    }
  }
}
