import { type ScriptInput, clearBucket, clearDdb } from "../../../db/lib";
import { glob } from "glob";
import mime from "mime";
import fs from "fs-extra";
import { Bucket } from "sst/node/bucket";
import { Config } from "sst/node/config";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { ZMockGhUser } from "@spencerduballcom/db/ddb";

/**
 * This procedure is meant to be called from the database scripts and will insert habitat data. Such as files and
 * database records that should always exist in your app - or files that don't change much. For example, we don't
 * need to reupload a large set of files evertime we replant the seed info.
 */
export async function up({ s3Client, ddb }: ScriptInput) {
  if (!s3Client) throw new Error("s3Client was not passed and is required.");
  if (!ddb) throw new Error("ddb was not supplied and is required.");

  // Create Mock Github Database
  // ---------------------------
  // For testing and development this app will mock API requests that go to Github. These requests will be backed by a
  // database and files put up by us in this habitat file.

  // (1) Upload mock Github user's profile photos.
  const AssetsPath = new URL("./assets", import.meta.url);
  const assets = await glob(`${AssetsPath.pathname}/**/*`, { nodir: true });
  await Promise.all([
    assets.map(async (asset) => {
      const Key = "mock" + asset.replace(new RegExp(`^${AssetsPath.pathname}`), "");
      const Body = await fs.readFile(asset);
      const ContentType = mime.getType(asset) || "text/plain";
      const options = { Bucket: Bucket.Bucket.bucketName, Key, Body, ContentType };
      return s3Client.send(new PutObjectCommand(options));
    }),
  ]);

  // (2) Populate the "mock-gh-users" ddb items.
  const mockGhUsersFile = new URL("./data/mock-gh-users.json", import.meta.url);
  const mockGhUsersData = await fs
    .readJson(mockGhUsersFile)
    .then((users) => ZMockGhUser.omit({ pk: true, sk: true, entity: true }).array().parse(users));
  for (let user of mockGhUsersData) user.avatar_url = user.avatar_url.replace(/\{\{S3_BUCKET\}\}/g, Config.BUCKET_URL);
  await ddb.table.batchWrite(mockGhUsersData.map((u) => ddb.entities.mockGhUser.putBatch(u)));
}

/**
 * This procedure is meant to be called from the database scripts and will delete habitat data.
 */
export async function down({ s3Client, ddb }: ScriptInput) {
  if (!s3Client) throw new Error("s3Client was not passed and is required.");
  if (!ddb) throw new Error("ddb was not supplied and is required.");

  // Remove the mock Github user's profile photos.
  await clearBucket({ Bucket: Bucket.Bucket.bucketName, s3Client, prefix: "mock/users/" });

  // Remove the "mock-gh-users" ddb items
  await clearDdb({ ddb, query: { pk: "mock_gh_user " } });
}
