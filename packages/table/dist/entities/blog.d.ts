import { z } from "zod";
export declare const BlogSchema: {
    readonly name: "Blog";
    readonly attributes: {
        readonly id: {
            readonly type: "string";
            readonly default: () => string;
        };
        readonly title: {
            readonly type: "string";
            readonly required: true;
        };
        readonly image_url: {
            readonly type: "string";
            readonly required: true;
        };
        readonly tags: {
            readonly type: "list";
        };
        readonly s3_url: {
            readonly type: "string";
            readonly required: true;
        };
        readonly author_id: {
            readonly type: "string";
            readonly required: true;
        };
        readonly views: {
            readonly type: "number";
            readonly default: 0;
        };
        readonly content_modified: {
            readonly type: "string";
            readonly dependsOn: "created";
            readonly default: (data: {
                created: string;
            }) => string;
        };
        readonly published: {
            readonly type: "boolean";
            readonly default: false;
        };
        readonly pk: {
            readonly partitionKey: true;
            readonly type: "string";
            readonly default: (data: {
                id: string;
            }) => string;
        };
        readonly sk: {
            readonly sortKey: true;
            readonly type: "string";
            readonly default: (data: {
                id: string;
            }) => string;
        };
        readonly gsi1pk: {
            readonly type: "string";
            readonly default: "blog";
        };
        readonly gsi1sk: {
            readonly type: "string";
            readonly dependsOn: "created";
            readonly default: (data: {
                id: string;
                published: boolean;
                created: string;
            }) => string;
        };
        readonly gsi2pk: {
            readonly type: "string";
            readonly default: "blog";
        };
        readonly gsi2sk: {
            readonly type: "string";
            readonly dependsOn: "views";
            readonly default: (data: {
                id: string;
                published: boolean;
                views: number;
            }) => string;
        };
    };
};
export declare const ZBlog: z.ZodObject<{
    pk: z.ZodString;
    sk: z.ZodString;
    gsi1pk: z.ZodString;
    gsi1sk: z.ZodString;
    gsi2pk: z.ZodString;
    gsi2sk: z.ZodString;
    id: z.ZodString;
    title: z.ZodString;
    image_url: z.ZodString;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    s3_url: z.ZodString;
    author_id: z.ZodString;
    views: z.ZodNumber;
    content_modified: z.ZodString;
    published: z.ZodBoolean;
    modified: z.ZodString;
    created: z.ZodString;
    entity: z.ZodString;
}, "strip", z.ZodTypeAny, {
    tags?: string[] | undefined;
    created: string;
    views: number;
    pk: string;
    sk: string;
    gsi1pk: string;
    gsi1sk: string;
    gsi2pk: string;
    gsi2sk: string;
    id: string;
    title: string;
    image_url: string;
    s3_url: string;
    author_id: string;
    content_modified: string;
    published: boolean;
    modified: string;
    entity: string;
}, {
    tags?: string[] | undefined;
    created: string;
    views: number;
    pk: string;
    sk: string;
    gsi1pk: string;
    gsi1sk: string;
    gsi2pk: string;
    gsi2sk: string;
    id: string;
    title: string;
    image_url: string;
    s3_url: string;
    author_id: string;
    content_modified: string;
    published: boolean;
    modified: string;
    entity: string;
}>;
export type BlogType = ReturnType<typeof ZBlog.parse>;
//# sourceMappingURL=blog.d.ts.map