const graphQlUserSchema = require('./user');
const graphQlPurchaseSchema = require('./purchase')
const graphQlCartSchema = require('./cart')
const schema = require('./schema')

const schemaArray = [schema, graphQlUserSchema, graphQlPurchaseSchema, graphQlCartSchema];

module.exports = schemaArray;