!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports,require("dynamodb-toolbox"),require("@aws-sdk/lib-dynamodb"),require("zod"),require("ms"),require("crypto")):"function"==typeof define&&define.amd?define(["exports","dynamodb-toolbox","@aws-sdk/lib-dynamodb","zod","ms","crypto"],e):e((t||self).ddb={},t.dynamodbToolbox,t.libDynamodb,t.zod,t.ms,t.crypto)}(this,function(t,e,n,r,i,s){function o(t){return t&&"object"==typeof t&&"default"in t?t:{default:t}}var u=/*#__PURE__*/o(i),d={name:"Session",attributes:{id:{type:"string",default:function(){return s.randomBytes(16).toString("hex")}},pk:{partitionKey:!0,type:"string",default:function(t){return"session#"+t.id}},sk:{sortKey:!0,type:"string",default:function(t){return"session#"+t.id}},gsi1pk:{type:"string",dependsOn:"userId",default:function(t){return"user#"+t.userId}},gsi1sk:{type:"string",dependsOn:"id",default:function(t){return t.pk}},userId:{type:"number",required:!0},username:{type:"string",required:!0},name:{type:"string",required:!0},avatarUrl:{type:"string"},githubUrl:{type:"string",required:!0},roles:{type:"list"},ttl:{type:"number",required:!0}}},a=r.z.object({id:r.z.string(),pk:r.z.string(),sk:r.z.string(),userId:r.z.number(),username:r.z.string(),name:r.z.string(),avatarUrl:r.z.string().optional(),githubUrl:r.z.string(),roles:r.z.preprocess(function(t){return t||[]},r.z.string().array()),ttl:r.z.number(),modified:r.z.string(),created:r.z.string(),entity:r.z.string()}),l=r.z.object({id:r.z.string(),redirectUri:r.z.string().optional()}),p={name:"OAuthStateCode",attributes:{id:{type:"string",default:function(){return s.randomBytes(16).toString("hex")}},pk:{partitionKey:!0,type:"string",default:function(t){return"oauth_state_code#"+t.id}},sk:{sortKey:!0,type:"string",default:function(t){return"oauth_state_code#"+t.id}},redirectUri:{type:"string"},code:{type:"string",dependsOn:["id","redirectUri"],default:function(t){return JSON.stringify(l.parse(t))}},ttl:{type:"number",default:function(){return Math.round(((new Date).getTime()+u.default("15m"))/1e3)}}}},g=r.z.object({id:r.z.string(),pk:r.z.string(),sk:r.z.string(),redirectUri:r.z.string().optional(),code:r.z.string(),ttl:r.z.number(),modified:r.z.string(),created:r.z.string(),entity:r.z.string()}),y={name:"OAuthMock",attributes:{id:{type:"string",required:!0},pk:{partitionKey:!0,type:"string",default:function(t){return"oauth_mock#"+t.id}},sk:{sortKey:!0,type:"string",default:function(t){return"oauth_mock#"+t.id}},userId:{type:"number",required:!0},ttl:{type:"number",default:function(){return Math.round(((new Date).getTime()+u.default("15m"))/1e3)}}}},c=r.z.object({id:r.z.string(),pk:r.z.string(),sk:r.z.string(),userId:r.z.number(),ttl:r.z.number(),modified:r.z.string(),created:r.z.string(),entity:r.z.string()}),f={marshallOptions:{convertEmptyValues:!1,removeUndefinedValues:!1,convertClassInstanceToMap:!1},unmarshallOptions:{wrapNumbers:!1}};t.Ddb=function(t){this.table=void 0,this.entities={oauthStateCode:new e.Entity(p),session:new e.Entity(d),oauthMock:new e.Entity(y)},this.table=new e.Table({name:t.tableName,partitionKey:"pk",sortKey:"sk",indexes:{gsi1:{partitionKey:"gsi1pk",sortKey:"gsi1sk"}},DocumentClient:n.DynamoDBDocumentClient.from(t.client,f)});for(var r=0,i=Object.values(this.entities);r<i.length;r++)i[r].table=this.table},t.OAuthMockSchema=y,t.OAuthStateCodeSchema=p,t.SessionSchema=d,t.ZCode=l,t.ZOAuthMock=c,t.ZOAuthStateCode=g,t.ZSession=a});
//# sourceMappingURL=index.umd.js.map
