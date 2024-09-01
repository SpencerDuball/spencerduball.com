import { QueryResult, RootOperationNode, UnknownRow, KyselyPlugin, PluginTransformQueryArgs, PluginTransformResultArgs } from "kysely";
export declare class NoopPlugin implements KyselyPlugin {
    transformQuery(args: PluginTransformQueryArgs): RootOperationNode;
    transformResult(args: PluginTransformResultArgs): Promise<QueryResult<UnknownRow>>;
}
