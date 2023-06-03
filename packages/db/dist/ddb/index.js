"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ddb = exports.ZOAuthMock = exports.OAuthMockSchema = exports.ZOAuthStateCode = exports.OAuthStateCodeSchema = exports.ZCode = exports.ZSession = exports.SessionSchema = void 0;
const dynamodb_toolbox_1 = require("dynamodb-toolbox");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const zod_1 = require("zod");
const ms_1 = __importDefault(require("ms"));
const crypto_1 = require("crypto");
/* ------------------------------------------------------------------------------------------------------------
 * Session
 * ------------------------------------------------------------------------------------------------------------ */
exports.SessionSchema = {
    name: "Session",
    attributes: {
        id: { type: "string", default: () => (0, crypto_1.randomBytes)(16).toString("hex") },
        pk: { partitionKey: true, type: "string", default: (data) => `session#${data.id}` },
        sk: { sortKey: true, type: "string", default: (data) => `session#${data.id}` },
        gsi1pk: { type: "string", dependsOn: "userId", default: (data) => `user#${data.userId}` },
        gsi1sk: { type: "string", dependsOn: "id", default: (data) => data.pk },
        userId: { type: "number", required: true },
        username: { type: "string", required: true },
        name: { type: "string", required: true },
        avatarUrl: { type: "string" },
        githubUrl: { type: "string", required: true },
        roles: { type: "list" },
        ttl: { type: "number", required: true },
    },
};
exports.ZSession = zod_1.z.object({
    id: zod_1.z.string(),
    pk: zod_1.z.string(),
    sk: zod_1.z.string(),
    userId: zod_1.z.number(),
    username: zod_1.z.string(),
    name: zod_1.z.string(),
    avatarUrl: zod_1.z.string().optional(),
    githubUrl: zod_1.z.string(),
    roles: zod_1.z.preprocess((val) => (val ? val : []), zod_1.z.string().array()),
    ttl: zod_1.z.number(),
    modified: zod_1.z.string(),
    created: zod_1.z.string(),
    entity: zod_1.z.string(),
});
/* ------------------------------------------------------------------------------------------------------------
 * OAuthStateCode
 * ------------------------------------------------------------------------------------------------------------ */
exports.ZCode = zod_1.z.object({ id: zod_1.z.string(), redirectUri: zod_1.z.string().optional() });
exports.OAuthStateCodeSchema = {
    name: "OAuthStateCode",
    attributes: {
        id: { type: "string", default: () => (0, crypto_1.randomBytes)(16).toString("hex") },
        pk: { partitionKey: true, type: "string", default: (data) => `oauth_state_code#${data.id}` },
        sk: { sortKey: true, type: "string", default: (data) => `oauth_state_code#${data.id}` },
        redirectUri: { type: "string" },
        code: {
            type: "string",
            dependsOn: ["id", "redirectUri"],
            default: (data) => JSON.stringify(exports.ZCode.parse(data)),
        },
        ttl: { type: "number", default: () => Math.round((new Date().getTime() + (0, ms_1.default)("15m")) / 1000) },
    },
};
exports.ZOAuthStateCode = zod_1.z.object({
    id: zod_1.z.string(),
    pk: zod_1.z.string(),
    sk: zod_1.z.string(),
    redirectUri: zod_1.z.string().optional(),
    code: zod_1.z.string(),
    ttl: zod_1.z.number(),
    modified: zod_1.z.string(),
    created: zod_1.z.string(),
    entity: zod_1.z.string(),
});
/* ------------------------------------------------------------------------------------------------------------
 * OAuthMock
 * ------------------------------------------------------------------------------------------------------------ */
exports.OAuthMockSchema = {
    name: "OAuthMock",
    attributes: {
        id: { type: "string", required: true },
        pk: { partitionKey: true, type: "string", default: (data) => `oauth_mock#${data.id}` },
        sk: { sortKey: true, type: "string", default: (data) => `oauth_mock#${data.id}` },
        userId: { type: "number", required: true },
        ttl: { type: "number", default: () => Math.round((new Date().getTime() + (0, ms_1.default)("15m")) / 1000) },
    },
};
exports.ZOAuthMock = zod_1.z.object({
    id: zod_1.z.string(),
    pk: zod_1.z.string(),
    sk: zod_1.z.string(),
    userId: zod_1.z.number(),
    ttl: zod_1.z.number(),
    modified: zod_1.z.string(),
    created: zod_1.z.string(),
    entity: zod_1.z.string(),
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
class Ddb {
    table;
    entities = {
        oauthStateCode: new dynamodb_toolbox_1.Entity(exports.OAuthStateCodeSchema),
        session: new dynamodb_toolbox_1.Entity(exports.SessionSchema),
        oauthMock: new dynamodb_toolbox_1.Entity(exports.OAuthMockSchema),
    };
    constructor(props) {
        this.table = new dynamodb_toolbox_1.Table({
            name: props.tableName,
            partitionKey: "pk",
            sortKey: "sk",
            // gsi1 is used to search for all session of a user.
            // @example { gsi1pk: "user#<userId>", gsi1sk: "session#<sessionId>" }
            indexes: { gsi1: { partitionKey: "gsi1pk", sortKey: "gsi1sk" } },
            DocumentClient: lib_dynamodb_1.DynamoDBDocumentClient.from(props.client, translateConfig),
        });
        // assign the table to all entities
        for (let entity of Object.values(this.entities)) {
            entity.table = this.table;
        }
    }
}
exports.Ddb = Ddb;
