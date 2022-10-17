"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZUserEntity = exports.UserEntity = exports.UserSchema = void 0;
const dynamodb_toolbox_1 = require("dynamodb-toolbox");
const zod_1 = require("zod");
exports.UserSchema = {
    name: "User",
    attributes: {
        pk: { partitionKey: true, type: "string", default: (data) => `user#${data.id}` },
        sk: { sortKey: true, type: "string", default: (data) => `user#${data.id}` },
        id: { type: "string", required: true },
        username: { type: "string", required: true },
        name: { type: "string", required: true },
        avatar_url: { type: "string" },
        github_url: { type: "string", required: true },
        roles: { type: "list" },
        permissions: { type: "list" },
    },
};
exports.UserEntity = new dynamodb_toolbox_1.Entity(exports.UserSchema);
exports.ZUserEntity = zod_1.z.object({
    pk: zod_1.z.string(),
    sk: zod_1.z.string(),
    id: zod_1.z.string(),
    username: zod_1.z.string(),
    name: zod_1.z.string(),
    avatar_url: zod_1.z.string().optional(),
    github_url: zod_1.z.string(),
    roles: zod_1.z.array(zod_1.z.string()).optional(),
    permissions: zod_1.z.array(zod_1.z.string()).optional(),
    modified: zod_1.z.string(),
    created: zod_1.z.string(),
    entity: zod_1.z.string(),
});
