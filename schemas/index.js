const graphQlUserSchema = require('./user');
const graphQlPurchaseSchema = require('./purchase');
const graphQlCartSchema = require('./cart');
const graphQlLikeSchema = require('./like');
const graphQlPostSchema = require('./post');
const schema = require('./schema');

const schemaArray = [
    schema,
    graphQlUserSchema,
    graphQlPurchaseSchema,
    graphQlCartSchema,
    graphQlLikeSchema,
    graphQlPostSchema
];

module.exports = schemaArray;