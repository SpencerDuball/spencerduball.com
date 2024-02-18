import { Kysely } from "kysely";
import { ListObjectsV2Command, ListObjectsV2CommandOutput, DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import { Ddb } from "@spencerduballcom/db/ddb";
import ora from "ora";
import { QueryOptions } from "dynamodb-toolbox";
import { z } from "zod";
import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb";

const S3_MAX_BATCH = 25;

/** Common input to all scripts including seed and fixture scripts. */
export interface ScriptInput<T = any> {
  /** The Kysely client for executing SQL commands. */
  sqldb?: Kysely<T>;
  /** The S3 Client to for executing S3 commands. */
  s3Client?: S3Client;
  /** The DynamoDB Client for executing DDB comamnds. */
  ddb?: Ddb;
}

export interface ClearBucketProps {
  /** The bucket name of the S3 bucket. */
  Bucket: string;
  /** The S3 client. */
  s3Client: S3Client;
  /** The prefix of items to delete. */
  prefix?: string;
}
/**
 * Clears an S3 Bucket's contents for the specified prefix. If no prefix is supplied, then all items in the bucket will
 * be deleted. If multiple prefixes need to be deleted, then multiple calls of this function should be issued.
 *
 * @example To delete all files for the mock user 1, we can use prefix "mock/users/1/". Note if we omit the trailing
 * "/" then [10, 11, 12, 111, ...] will be matched!
 */
export async function clearBucket({ Bucket, s3Client, prefix }: ClearBucketProps) {
  const s3 = s3Client;

  // get the Key of each item in the bucket
  let spinner = ora("Getting the objects to delete ...").start();
  if (prefix) spinner.text = `Getting the objects with prefix '${prefix}' to delete ...`;
  const itemKeys: string[] = [];
  let nextToken: string | null = null;
  do {
    const { NextContinuationToken, Contents } = (await s3.send(
      new ListObjectsV2Command({ Bucket, ContinuationToken: nextToken ?? undefined, Prefix: prefix ?? undefined }),
    )) as ListObjectsV2CommandOutput;
    Contents?.map(({ Key }) => Key && itemKeys.push(Key));
    nextToken = NextContinuationToken ?? null;
  } while (nextToken);

  // batch items to delete
  spinner.text = `Deleting ${itemKeys.length} items from bucket ...`;
  const batchesToDelete = Array.from({ length: Math.ceil(itemKeys.length / S3_MAX_BATCH) }, (_, index) =>
    itemKeys.slice(index * S3_MAX_BATCH, (index + 1) * S3_MAX_BATCH),
  ).map((batch) => batch.map((Key) => ({ Key })));

  // delete each batch of items
  await Promise.all(
    batchesToDelete.map((batch) => s3.send(new DeleteObjectsCommand({ Bucket, Delete: { Objects: batch } }))),
  );

  if (itemKeys.length > 0) spinner.succeed(`Deleted ${itemKeys.length} items from bucket!`);
  else spinner.succeed(`No S3 items to delete.`);
}

type DdbResultType = Awaited<ReturnType<Ddb["table"]["scan"]>> | Awaited<ReturnType<Ddb["table"]["query"]>>;
export type ClearDdbProps = {
  /** The DynamoDB client. */
  ddb: Ddb;
  /** The optional Query. */
  query?: {
    pk: any;
    options?: QueryOptions<any, any>;
  };
};
/**
 * Clears a DDB Table's contents corresponding to the specified query, or if no query is provided then all items in the
 * dynamodb table will be deleted.
 *
 * @example await clearDdb({ ddb, query: { pk: "mock_gh_user", options: { beginsWith: "mock_gh_user" } } })
 */
export async function clearDdb({ ddb, query }: ClearDdbProps) {
  const spinner = ora("Deleting ddb items ...").start();

  let count = 0;
  let result: DdbResultType | undefined = undefined;
  do {
    // run the initial query if first loop
    if (!result) {
      if (query) result = await ddb.table.query(query.pk, { ...query.options, attributes: ["pk", "sk"] });
      else result = await ddb.table.scan({ attributes: ["pk", "sk"] });
    } else if (result && result.next) result = await result.next();
    else if (result && !result.next) result = undefined;

    // delete the batch of items
    if (result?.Items && result.Items.length > 0) {
      count = count + 1;
      const items = z.object({ pk: z.string(), sk: z.string() }).array().parse(result.Items);
      const deleteItems = items.map((item) => ({ DeleteRequest: { Key: { pk: item.pk, sk: item.sk } } }));
      const r = await ddb.table.DocumentClient.send(
        new BatchWriteCommand({ RequestItems: { [ddb.table.name]: deleteItems } }),
      );
      spinner.text = `Deleted batch ${count + 1}`;
    }
  } while (result?.next);

  if (count > 0) spinner.succeed(`Deleted all ${count} batches of dynamodb items.`);
  else spinner.succeed(`No DDB items to delete.`);
}
