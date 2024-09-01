export class NoopPlugin {
    transformQuery(args) {
        return args.node;
    }
    async transformResult(args) {
        return args.result;
    }
}
