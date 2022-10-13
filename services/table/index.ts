import { DynamoDB } from "aws-sdk";
import { Table as DdbTable, Entity } from "dynamodb-toolbox";
import { UserSchema } from "./entities";

export class Table {
  table: DdbTable<string, "pk", "sk">;

  entities = { user: new Entity(UserSchema) };

  constructor(props: { tableName: string; client: DynamoDB.DocumentClient }) {
    this.table = new DdbTable({
      name: props.tableName,
      partitionKey: "pk",
      sortKey: "sk",
      DocumentClient: props.client,
    });

    // assign the table to all entities
    for (let entity of Object.values(this.entities)) {
      entity.table = this.table as any;
    }
  }
}

export * from "./entities";
