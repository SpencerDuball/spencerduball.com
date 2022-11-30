import * as DynamoDB from "aws-sdk/clients/dynamodb";
import { Table as DdbTable, Entity } from "dynamodb-toolbox";
import { UserSchema, OAuthStateCodeSchema, SessionSchema, BlogSchema } from "./entities";

export class Table {
  table: DdbTable<string, "pk", "sk">;

  entities = {
    user: new Entity(UserSchema),
    oAuthStateCode: new Entity(OAuthStateCodeSchema),
    session: new Entity(SessionSchema),
    blog: new Entity(BlogSchema),
  };

  constructor(props: { tableName: string; client: DynamoDB.DocumentClient }) {
    this.table = new DdbTable({
      name: props.tableName,
      partitionKey: "pk",
      sortKey: "sk",
      indexes: {
        /** Index to search for items in a collection, sorted by published status + creation time.
         * @example { pk: "blog", sk: "published#<true|false>#created#<created>#blog#<blog_id>" }
         * @example { pk: "blog#<blog_id>", sk: "created#<created>#comment#<comment_id>"}
         */
        gsi1: { partitionKey: "gsi1pk", sortKey: "gsi1sk" },
        /** Index to search for items in a collection, sorted by published status + number of views.
         * @example { pk: "blog", sk: "published#<true|false>#views#<views>#blog#<blog_id>" }
         */
        gsi2: { partitionKey: "gsi2pk", sortKey: "gsi2sk" }, // type#blog, published#<true|false>#views#<created>#blog#<blog_id>
      },
      DocumentClient: props.client,
    });

    // assign the table to all entities
    for (let entity of Object.values(this.entities)) {
      entity.table = this.table as any;
    }
  }
}

export * from "./entities";
