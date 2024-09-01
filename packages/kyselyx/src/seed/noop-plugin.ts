import {
  QueryResult,
  RootOperationNode,
  UnknownRow,
  KyselyPlugin,
  PluginTransformQueryArgs,
  PluginTransformResultArgs,
} from "kysely";

export class NoopPlugin implements KyselyPlugin {
  transformQuery(args: PluginTransformQueryArgs): RootOperationNode {
    return args.node;
  }

  async transformResult(args: PluginTransformResultArgs): Promise<QueryResult<UnknownRow>> {
    return args.result;
  }
}
