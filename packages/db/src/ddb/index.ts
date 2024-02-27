import { Table, Entity } from "dynamodb-toolbox";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";
import { randomBytes } from "crypto";
// @ts-ignore
import ms from "ms"; // TODO: This package has types that aren't defined correctly when using "Bundler" module resolution strategy.

/* ------------------------------------------------------------------------------------------------------------------
 * Session
 * ------------------------------------------------------------------------------------------------------------------ */
export const SessionSchema = {
  name: "Session",
  attributes: {
    // Generated Attributes
    id: { type: "string", default: () => randomBytes(16).toString("hex") },
    pk: {
      partitionKey: true,
      type: "string",
      dependsOn: ["id"],
      default: (data: { id: string }) => `session#${data.id}`,
    },
    sk: { sortKey: true, type: "string", dependsOn: ["id"], default: (data: { id: string }) => `session#${data.id}` },
    gsi1pk: { type: "string", dependsOn: "user_id", default: (data: { user_id: string }) => `user#${data.user_id}` },
    gsi1sk: { type: "string", dependsOn: "id", default: (data: { pk: string }) => data.pk },
    // Required Attributes
    user_id: { type: "number", required: true },
    username: { type: "string", required: true },
    name: { type: "string", required: true },
    avatar_url: { type: "string" },
    github_url: { type: "string", required: true },
    ttl: { type: "number", required: true },
    // Optional Attributes
    roles: { type: "list" },
  },
} as const;

export const ZSession = z.object({
  // Generated Attributes
  id: z.string(),
  pk: z.string(),
  sk: z.string(),
  gsi1pk: z.string(),
  gsi1sk: z.string(),
  modified: z.string(),
  created: z.string(),
  entity: z.string(),
  // Required Attributes
  user_id: z.number(),
  username: z.string(),
  name: z.string(),
  avatar_url: z.string().optional(),
  github_url: z.string(),
  ttl: z.number(),
  // Optional Attributes
  roles: z.preprocess((val) => (val ? val : []), z.string().array()),
});

export type SessionType = z.infer<typeof ZSession>;

/* ------------------------------------------------------------------------------------------------------------------
 * OAuthStateCode
 * ------------------------------------------------------------------------------------------------------------------ */
export const ZCode = z.object({ id: z.string(), redirect_uri: z.string() });

export const OAuthStateCodeSchema = {
  name: "OAuthStateCode",
  attributes: {
    // Generated Attributes
    id: { type: "string", default: () => randomBytes(16).toString("hex") },
    pk: {
      partitionKey: true,
      type: "string",
      dependsOn: ["id"],
      default: (data: { id: string }) => `oauth_state_code#${data.id}`,
    },
    sk: {
      sortKey: true,
      type: "string",
      dependsOn: ["id"],
      default: (data: { id: string }) => `oauth_state_code#${data.id}`,
    },
    code: {
      type: "string",
      dependsOn: ["id", "redirect_uri"],
      default: (data: { id: string; redirect_uri: string }) => JSON.stringify(ZCode.parse(data)),
    },
    ttl: { type: "number", default: () => Math.round((new Date().getTime() + ms("15m")) / 1000) },
    // Required Attributes
    redirect_uri: { type: "string", required: true },
  },
} as const;

export const ZOAuthStateCode = z.object({
  // Generated Attributes
  id: z.string(),
  pk: z.string(),
  sk: z.string(),
  code: z.string(),
  ttl: z.number(),
  modified: z.string(),
  created: z.string(),
  entity: z.string(),
  // Required Attributes
  redirect_uri: z.string(),
});

export type OAuthStateCodeType = ReturnType<typeof ZOAuthStateCode.parse>;

/* ------------------------------------------------------------------------------------------------------------------
 * OAuthOTC (Used only when MOCKS_ENABLED to simulate an OTC to be exchaned for an access token.)
 * ------------------------------------------------------------------------------------------------------------------ */
export const OAuthOTCSchema = {
  name: "OAuthOTC",
  attributes: {
    // Generated Attributes
    id: { type: "string", default: () => randomBytes(16).toString("hex") },
    pk: {
      partitionKey: true,
      type: "string",
      dependsOn: ["id"],
      default: (data: { id: string }) => `oauth_otc#${data.id}`,
    },
    sk: { sortKey: true, type: "string", dependsOn: ["id"], default: (data: { id: string }) => `oauth_otc#${data.id}` },
    ttl: { type: "number", default: () => Math.round((new Date().getTime() + ms("15m")) / 1000) },
    // Required Attributes
    scope: { type: "string", required: true },
    user_id: { type: "number", required: true },
  },
} as const;

export const ZOAuthOTC = z.object({
  // Generated Attributes
  id: z.string(),
  pk: z.string(),
  sk: z.string(),
  ttl: z.number(),
  modified: z.string(),
  created: z.string(),
  entity: z.string(),
  // Required Attributes
  scope: z.string(),
  user_id: z.number(),
});

export type OAuthOTC = ReturnType<typeof ZOAuthOTC.parse>;

/* ------------------------------------------------------------------------------------------------------------------
 * OAuthAccessToken (Used only when MOCKS_ENABLED to simulate an access_token to be used for Mock Github API access.)
 * ------------------------------------------------------------------------------------------------------------------ */
export const OAuthAccessTokenSchema = {
  name: "OAuthAccessToken",
  attributes: {
    // Generated Attributes
    id: { type: "string", default: () => randomBytes(16).toString("hex") },
    pk: {
      partitionKey: true,
      type: "string",
      dependsOn: ["id"],
      default: (data: { id: string }) => `oauth_access_token#${data.id}`,
    },
    sk: {
      sortKey: true,
      type: "string",
      dependsOn: ["id"],
      default: (data: { id: string }) => `oauth_access_token#${data.id}`,
    },
    ttl: { type: "number", default: () => Math.round((new Date().getTime() + ms("15m")) / 1000) },
    // Required Attributes
    scope: { type: "string", required: true },
    user_id: { type: "number", required: true },
  },
} as const;

export const ZOAuthAccessToken = z.object({
  // Generated Attributes
  id: z.string(),
  pk: z.string(),
  sk: z.string(),
  ttl: z.number(),
  modified: z.string(),
  created: z.string(),
  entity: z.string(),
  // Required Attributes
  scope: z.string(),
  user_id: z.number(),
});

export type OAuthAccessToken = ReturnType<typeof ZOAuthAccessToken.parse>;

/* ------------------------------------------------------------------------------------------------------------------
 * MockGhUser (Used only when MOCKS_ENABLED. This is a fake database of potential Github users.)
 * ------------------------------------------------------------------------------------------------------------------ */
export const MockGhUserSchema = {
  name: "MockGhUser",
  attributes: {
    // Generated Attributes
    pk: { partitionKey: true, type: "string", default: () => `mock_gh_user` },
    sk: {
      sortKey: true,
      type: "string",
      dependsOn: ["id"],
      default: (data: { id: string }) => `mock_gh_user#${data.id}`,
    },
    // Required Attributes
    id: { type: "number", required: true },
    login: { type: "string", required: true },
    name: { type: "string", required: true },
    avatar_url: { type: "string", required: true },
    html_url: { type: "string", required: true },
  },
  modifiedAlias: "modified_at",
  createdAlias: "created_at",
} as const;

export const ZMockGhUser = z.object({
  // Generated Attributes
  pk: z.string(),
  sk: z.string(),
  modified_at: z.string(),
  created_at: z.string(),
  entity: z.string(),
  // Required Attributes
  id: z.number(),
  login: z.string(),
  name: z.string(),
  avatar_url: z.string(),
  html_url: z.string(),
});

export type MockGhUserType = ReturnType<typeof ZMockGhUser.parse>;

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
    oauthOTC: new Entity(OAuthOTCSchema),
    oauthAccessToken: new Entity(OAuthAccessTokenSchema),
    mockGhUser: new Entity(MockGhUserSchema),
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
    for (let entity of Object.values(this.entities)) entity.setTable(this.table);
  }
}
