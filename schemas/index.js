const graphQlUserSchema = require('./user');
const schema = require('./schema')

const schemaArray = [schema, graphQlUserSchema];

module.exports = schemaArray;