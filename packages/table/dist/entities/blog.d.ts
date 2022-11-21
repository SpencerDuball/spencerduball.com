import { z } from "zod";
export declare const BlogSchema: {
    name: string;
    attributes: {
        pk: {
            partitionKey: boolean;
            type: string;
            default: (data: {
                id: string;
            }) => string;
        };
        sk: {
            sortKey: boolean;
            type: string;
            default: (data: {
                id: string;
            }) => string;
        };
        id: {
            type: string;
            required: boolean;
        };
        title: {
            type: string;
            required: boolean;
        };
        image_url: {
            type: string;
            required: boolean;
        };
        tags: {
            type: string;
        };
        s3_url: {
            type: string;
            required: boolean;
        };
        author_id: {
            type: string;
            required: boolean;
        };
        views: {
            type: string;
            required: boolean;
        };
        content_modified: {
            type: string;
            required: boolean;
        };
        published: {
            type: string;
            default: boolean;
        };
    };
};
export declare const ZBlog: z.ZodObject<{
    pk: z.ZodString;
    sk: z.ZodString;
    id: z.ZodString;
    title: z.ZodString;
    image_url: z.ZodString;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    s3_url: z.ZodString;
    author_id: z.ZodString;
    views: z.ZodNumber;
    content_modified: z.ZodString;
    published: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    tags?: string[] | undefined;
    pk: string;
    sk: string;
    id: string;
    title: string;
    image_url: string;
    s3_url: string;
    author_id: string;
    views: number;
    content_modified: string;
    published: boolean;
}, {
    tags?: string[] | undefined;
    pk: string;
    sk: string;
    id: string;
    title: string;
    image_url: string;
    s3_url: string;
    author_id: string;
    views: number;
    content_modified: string;
    published: boolean;
}>;
export declare type BlogType = ReturnType<typeof ZBlog.parse>;
//# sourceMappingURL=blog.d.ts.map