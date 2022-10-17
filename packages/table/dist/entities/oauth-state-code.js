"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZOAuthStateCode = exports.OAuthStateCodeEntity = exports.OAuthStateCodeSchema = void 0;
const dynamodb_toolbox_1 = require("dynamodb-toolbox");
const zod_1 = require("zod");
const ms_1 = __importDefault(require("ms"));
const crypto_1 = require("crypto");
const ZCode = zod_1.z.object({ id: zod_1.z.string(), redirect_uri: zod_1.z.string().optional() });
exports.OAuthStateCodeSchema = {
    name: "OAuthStateCode",
    attributes: {
        id: { type: "string", default: () => (0, crypto_1.randomBytes)(16).toString("hex") },
        pk: { partitionKey: true, type: "string", default: (data) => `oauth_state_code#${data.id}` },
        sk: { sortKey: true, type: "string", default: (data) => `oauth_state_code#${data.id}` },
        redirect_uri: { type: "string" },
        code: { type: "string", default: (data) => JSON.stringify(ZCode.parse(data)) },
        ttl: { type: "number", default: () => Math.round((new Date().getTime() + (0, ms_1.default)("15m")) / 1000) },
    },
};
exports.OAuthStateCodeEntity = new dynamodb_toolbox_1.Entity(exports.OAuthStateCodeSchema);
exports.ZOAuthStateCode = zod_1.z.object({
    id: zod_1.z.string(),
    pk: zod_1.z.string(),
    sk: zod_1.z.string(),
    redirect_uri: zod_1.z.string().optional(),
    code: zod_1.z.string(),
    ttl: zod_1.z.number(),
    modified: zod_1.z.string(),
    created: zod_1.z.string(),
    entity: zod_1.z.string(),
});
