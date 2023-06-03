"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = void 0;
const kysely_1 = require("kysely");
const pg_1 = __importDefault(require("pg"));
function getClient(connectionUrl) {
    return new kysely_1.Kysely({
        dialect: new kysely_1.PostgresDialect({ pool: new pg_1.default.Pool({ connectionString: connectionUrl }) }),
    });
}
exports.getClient = getClient;
