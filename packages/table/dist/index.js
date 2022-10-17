"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = void 0;
const dynamodb_toolbox_1 = require("dynamodb-toolbox");
const entities_1 = require("./entities");
class Table {
    constructor(props) {
        this.entities = {
            user: new dynamodb_toolbox_1.Entity(entities_1.UserSchema),
            oAuthStateCode: new dynamodb_toolbox_1.Entity(entities_1.OAuthStateCodeSchema),
            session: new dynamodb_toolbox_1.Entity(entities_1.SessionSchema),
        };
        this.table = new dynamodb_toolbox_1.Table({
            name: props.tableName,
            partitionKey: "pk",
            sortKey: "sk",
            DocumentClient: props.client,
        });
        // assign the table to all entities
        for (let entity of Object.values(this.entities)) {
            entity.table = this.table;
        }
    }
}
exports.Table = Table;
__exportStar(require("./entities"), exports);
