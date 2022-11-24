"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZBlog = exports.BlogSchema = void 0;
const zod_1 = require("zod");
exports.BlogSchema = {
    name: "Blog",
    attributes: {
        id: { type: "string", required: true },
        title: { type: "string", required: true },
        image_url: { type: "string", required: true },
        tags: { type: "list" },
        s3_url: { type: "string", required: true },
        author_id: { type: "string", required: true },
        views: { type: "number", required: true },
        content_modified: { type: "string", required: true },
        published: { type: "boolean", default: false },
        pk: { partitionKey: true, type: "string", default: (data) => `blog#${data.id}` },
        sk: { sortKey: true, type: "string", default: (data) => `blog#${data.id}` },
        gsi1pk: { type: "string", default: "blog" },
        gsi1sk: {
            type: "string",
            default: (data) => `published#${data.published}#created#${data.created}#blog#${data.id}`,
        },
    },
};
exports.ZBlog = zod_1.z.object({
    pk: zod_1.z.string(),
    sk: zod_1.z.string(),
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
