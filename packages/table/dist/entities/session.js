"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZSession = exports.SessionEntity = exports.SessionSchema = void 0;
const dynamodb_toolbox_1 = require("dynamodb-toolbox");
const zod_1 = require("zod");
const crypto_1 = require("crypto");
exports.SessionSchema = {
    name: "Session",
    attributes: {
        id: { type: "string", default: () => (0, crypto_1.randomBytes)(16).toString("hex") },
        pk: { partitionKey: true, type: "string", default: (data) => `session#${data.user_id}` },
        sk: { sortKey: true, type: "string", default: (data) => `session#${data.id}` },
        user_id: { type: "string", required: true },
        ttl: { type: "number", required: true },
    },
};
exports.SessionEntity = new dynamodb_toolbox_1.Entity(exports.SessionSchema);
exports.ZSession = zod_1.z.object({
    id: zod_1.z.string(),
    pk: zod_1.z.string(),
    sk: zod_1.z.string(),
    user_id: zod_1.z.string(),
    ttl: zod_1.z.number(),
    modified: zod_1.z.string(),
    created: zod_1.z.string(),
    entity: zod_1.z.string(),
});
