const graphQlUserSchema = require('./user');
const graphQlPurchaseSchema = require('./purchase')
const graphQlCartSchema = require('./cart')
const graphQlTestingSchema = require('./testing');
const graphQlHowToDocSchema = require('./how-to-doc');
const schema = require('./schema');

const schemaArray = [schema, graphQlUserSchema, graphQlPurchaseSchema, graphQlCartSchema, graphQlTestingSchema, graphQlHowToDocSchema];

module.exports = schemaArray;