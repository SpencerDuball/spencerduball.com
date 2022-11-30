"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZBlog = exports.BlogSchema = void 0;
const zod_1 = require("zod");
const crypto_1 = require("crypto");
exports.BlogSchema = {
    name: "Blog",
    attributes: {
        id: { type: "string", default: () => (0, crypto_1.randomBytes)(5).toString("hex") },
        title: { type: "string", required: true },
        image_url: { type: "string", required: true },
        tags: { type: "list" },
        s3_url: { type: "string", required: true },
        author_id: { type: "string", required: true },
        views: { type: "number", default: 0 },
        content_modified: { type: "string", dependsOn: "created", default: (data) => data.created },
        published: { type: "boolean", default: false },
        pk: { partitionKey: true, type: "string", default: (data) => `blog#${data.id}` },
        sk: { sortKey: true, type: "string", default: (data) => `blog#${data.id}` },
        gsi1pk: { type: "string", default: "blog" },
        gsi1sk: {
            type: "string",
            dependsOn: "created",
            default: (data) => `published#${data.published}#created#${data.created}#blog#${data.id}`,
        },
        gsi2pk: { type: "string", default: "blog" },
        gsi2sk: {
            type: "string",
            dependsOn: "views",
            default: (data) => `published#${data.published}#views#${data.views}#blog#${data.id}`,
        },
    },
};
exports.ZBlog = zod_1.z.object({
    pk: zod_1.z.string(),
    sk: zod_1.z.string(),
    gsi1pk: zod_1.z.string(),
    gsi1sk: zod_1.z.string(),
    gsi2pk: zod_1.z.string(),
    gsi2sk: zod_1.z.string(),
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    image_url: zod_1.z.string(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    s3_url: zod_1.z.string(),
    author_id: zod_1.z.string(),
    views: zod_1.z.number(),
    content_modified: zod_1.z.string(),
    published: zod_1.z.boolean(),
    modified: zod_1.z.string(),
    created: zod_1.z.string(),
    entity: zod_1.z.string(),
});
