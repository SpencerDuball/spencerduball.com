import { Table, Entity } from "dynamodb-toolbox";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";
import { randomBytes } from "crypto";
// TODO: The @ts-ignore can be removed after the ms@3 is released. This is caused because of this bug:
// https://github.com/vercel/ms/pull/191
// @ts-ignore
import ms from "ms";
/* ------------------------------------------------------------------------------------------------------------------
 * Session
 * ------------------------------------------------------------------------------------------------------------------ */
export const SessionSchema = {
    name: "Session",
    attributes: {
        id: { type: "string", default: () => randomBytes(16).toString("hex") },
        pk: { partitionKey: true, type: "string", default: (data) => `session#${data.id}` },
        sk: { sortKey: true, type: "string", default: (data) => `session#${data.id}` },
        gsi1pk: { type: "string", dependsOn: "user_id", default: (data) => `user#${data.user_id}` },
        gsi1sk: { type: "string", dependsOn: "id", default: (data) => data.pk },
        user_id: { type: "number", required: true },
        username: { type: "string", required: true },
        name: { type: "string", required: true },
        avatar_url: { type: "string" },
        github_url: { type: "string", required: true },
        roles: { type: "list" },
        ttl: { type: "number", required: true },
    },
};
export const ZSession = z.object({
    id: z.string(),
    pk: z.string(),
    sk: z.string(),
    user_id: z.number(),
    username: z.string(),
    name: z.string(),
    avatar_url: z.string().optional(),
    github_url: z.string(),
    roles: z.preprocess((val) => (val ? val : []), z.string().array()),
    ttl: z.number(),
    modified: z.string(),
    created: z.string(),
    entity: z.string(),
});
/* ------------------------------------------------------------------------------------------------------------------
 * OAuthStateCode
 * ------------------------------------------------------------------------------------------------------------------ */
export const ZCode = z.object({ id: z.string(), redirect_uri: z.string() });
export const OAuthStateCodeSchema = {
    name: "OAuthStateCode",
    attributes: {
        id: { type: "string", default: () => randomBytes(16).toString("hex") },
        pk: { partitionKey: true, type: "string", default: (data) => `oauth_state_code#${data.id}` },
        sk: { sortKey: true, type: "string", default: (data) => `oauth_state_code#${data.id}` },
        redirect_uri: { type: "string", required: true },
        code: {
            type: "string",
            dependsOn: ["id", "redirect_uri"],
            default: (data) => JSON.stringify(ZCode.parse(data)),
        },
        ttl: { type: "number", default: () => Math.round((new Date().getTime() + ms("15m")) / 1000) },
    },
};
export const ZOAuthStateCode = z.object({
    id: z.string(),
    pk: z.string(),
    sk: z.string(),
    redirect_uri: z.string(),
    code: z.string(),
    ttl: z.number(),
    modified: z.string(),
    created: z.string(),
    entity: z.string(),
});
/* ------------------------------------------------------------------------------------------------------------------
 * OAuthOTC (Used only when MOCKS_ENABLED to simulate an OTC to be exchaned for an access token.)
 * ------------------------------------------------------------------------------------------------------------------ */
export const OAuthOTCSchema = {
    name: "OAuthOTC",
    attributes: {
        id: { type: "string", default: () => randomBytes(16).toString("hex") },
        scope: { type: "string", required: true },
        pk: {
            partitionKey: true,
            type: "string",
            dependsOn: ["id"],
            default: (data) => `oauth_otc#${data.id}`,
        },
        sk: { sortKey: true, type: "string", dependsOn: ["id"], default: (data) => `oauth_otc#${data.id}` },
        user_id: { type: "number", required: true },
        ttl: { type: "number", default: () => Math.round((new Date().getTime() + ms("15m")) / 1000) },
    },
};
export const ZOAuthOTC = z.object({
    id: z.string(),
    scope: z.string(),
    pk: z.string(),
    sk: z.string(),
    user_id: z.number(),
    ttl: z.number(),
    modified: z.string(),
    created: z.string(),
    entity: z.string(),
});
/* ------------------------------------------------------------------------------------------------------------------
 * OAuthAccessToken (Used only when MOCKS_ENABLED to simulate an access_token to be used for Mock Github API access.)
 * ------------------------------------------------------------------------------------------------------------------ */
export const OAuthAccessTokenSchema = {
    name: "OAuthAccessToken",
    attributes: {
        id: { type: "string", default: () => randomBytes(16).toString("hex") },
        scope: { type: "string", required: true },
        pk: {
            partitionKey: true,
            type: "string",
            dependsOn: ["id"],
            default: (data) => `oauth_access_token#${data.id}`,
        },
        sk: {
            sortKey: true,
            type: "string",
            dependsOn: ["id"],
            default: (data) => `oauth_access_token#${data.id}`,
        },
        user_id: { type: "number", required: true },
        ttl: { type: "number", default: () => Math.round((new Date().getTime() + ms("15m")) / 1000) },
    },
};
export const ZOAuthAccessToken = z.object({
    id: z.string(),
    scope: z.string(),
    pk: z.string(),
    sk: z.string(),
    user_id: z.string(),
    modified: z.string(),
    created: z.string(),
    entity: z.string(),
});
/* ------------------------------------------------------------------------------------------------------------------
 * MockGhUser (Used only when MOCKS_ENABLED. This is a fake database of potential Github users.)
 * ------------------------------------------------------------------------------------------------------------------ */
export const MockGhUserSchema = {
    name: "MockGhUser",
    attributes: {
        id: { type: "number", required: true },
        login: { type: "string", required: true },
        name: { type: "string", required: true },
        avatar_url: { type: "string", required: true },
        html_url: { type: "string", required: true },
        pk: { partitionKey: true, type: "string", default: () => `mock_gh_user` },
        sk: {
            sortKey: true,
            type: "string",
            dependsOn: ["id"],
            default: (data) => `mock_gh_user#${data.id}`,
        },
    },
    modifiedAlias: "modified_at",
    createdAlias: "created_at",
};
export const ZMockGhUser = z.object({
    id: z.number(),
    login: z.string(),
    name: z.string(),
    avatar_url: z.string(),
    html_url: z.string(),
    pk: z.string(),
    sk: z.string(),
    modified_at: z.string(),
    created_at: z.string(),
    entity: z.string(),
});
/* ------------------------------------------------------------------------------------------------------------
 * Ddb
 * ------------------------------------------------------------------------------------------------------------ */
const marshallOptions = {
    // Whether to automatically convert empty strings, blobs, and sets to `null`.
    convertEmptyValues: false,
    // Whether to remove undefined values while marshalling.
    removeUndefinedValues: false,
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
    table;
    entities = {
        oauthStateCode: new Entity(OAuthStateCodeSchema),
        session: new Entity(SessionSchema),
        oauthOTC: new Entity(OAuthOTCSchema),
        oauthAccessToken: new Entity(OAuthAccessTokenSchema),
        mockGhUser: new Entity(MockGhUserSchema),
    };
    constructor(props) {
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
        for (let entity of Object.values(this.entities))
            entity.setTable(this.table);
    }
}
