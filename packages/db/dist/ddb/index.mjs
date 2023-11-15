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
export const ZCode = z.object({ id: z.string(), redirectUri: z.string().optional() });
export const OAuthStateCodeSchema = {
    name: "OAuthStateCode",
    attributes: {
        id: { type: "string", default: () => randomBytes(16).toString("hex") },
        pk: { partitionKey: true, type: "string", default: (data) => `oauth_state_code#${data.id}` },
        sk: { sortKey: true, type: "string", default: (data) => `oauth_state_code#${data.id}` },
        redirect_uri: { type: "string" },
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
    redirect_uri: z.string().optional(),
    code: z.string(),
    ttl: z.number(),
    modified: z.string(),
    created: z.string(),
    entity: z.string(),
});
/* ------------------------------------------------------------------------------------------------------------------
 * OAuthMock
 * ------------------------------------------------------------------------------------------------------------------ */
export const OAuthMockSchema = {
    name: "OAuthMock",
    attributes: {
        id: { type: "string", required: true },
        pk: { partitionKey: true, type: "string", default: (data) => `oauth_mock#${data.id}` },
        sk: { sortKey: true, type: "string", default: (data) => `oauth_mock#${data.id}` },
        user_id: { type: "number", required: true },
        ttl: { type: "number", default: () => Math.round((new Date().getTime() + ms("15m")) / 1000) },
    },
};
export const ZOAuthMock = z.object({
    id: z.string(),
    pk: z.string(),
    sk: z.string(),
    user_id: z.number(),
    ttl: z.number(),
    modified: z.string(),
    created: z.string(),
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
        oauthMock: new Entity(OAuthMockSchema),
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
