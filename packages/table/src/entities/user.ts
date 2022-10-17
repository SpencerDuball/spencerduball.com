import { Entity, EntityItem } from "dynamodb-toolbox";
import { z } from "zod";

export const UserSchema = {
  name: "User",
  attributes: {
    pk: { partitionKey: true, type: "string", default: (data: { id: string }) => `user#${data.id}` },
    sk: { sortKey: true, type: "string", default: (data: { id: string }) => `user#${data.id}` },
    id: { type: "string", required: true },
    username: { type: "string", required: true },
    name: { type: "string", required: true },
    avatar_url: { type: "string" },
    github_url: { type: "string", required: true },
    roles: { type: "list" },
    permissions: { type: "list" },
  },
} as const;

export const UserEntity = new Entity(UserSchema);

export type UserEntityType = EntityItem<typeof UserEntity>;

export const ZUserEntity = z.object({
  pk: z.string(),
  sk: z.string(),
  id: z.string(),
  username: z.string(),
  name: z.string(),
  avatar_url: z.string().optional(),
  github_url: z.string(),
  roles: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional(),
  modified: z.string(),
  created: z.string(),
  entity: z.string(),
});
