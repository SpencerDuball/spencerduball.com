import{Kysely as o,PostgresDialect as n}from"kysely";import e from"pg";function r(r){return new o({dialect:new n({pool:new e.Pool({connectionString:r})})})}export{r as getClient};
//# sourceMappingURL=index.modern.js.map
