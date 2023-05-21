var e=require("kysely");function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=/*#__PURE__*/t(require("pg"));exports.getClient=function(t){return new e.Kysely({dialect:new e.PostgresDialect({pool:new n.default.Pool({connectionString:t})})})};
//# sourceMappingURL=index.cjs.map
