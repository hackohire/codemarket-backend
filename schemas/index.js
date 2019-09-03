const graphQlUserSchema = require('./user');
const graphQlPurchaseSchema = require('./purchase')
const schema = require('./schema')

const schemaArray = [schema, graphQlUserSchema, graphQlPurchaseSchema];

module.exports = schemaArray;