const graphQlUserSchema = require('./user');
const graphQlPurchaseSchema = require('./purchase');
const graphQlCartSchema = require('./cart');
const graphQlLikeSchema = require('./like');
const graphQlPostSchema = require('./post');
const graphQlSubscriptionSchema = require('./subscription');
const graphQlCompanySchema = require('./company');
const graphQlBookingSchema = require('./booking');
const schema = require('./schema');

const schemaArray = [
    schema,
    graphQlUserSchema,
    graphQlPurchaseSchema,
    graphQlCartSchema,
    graphQlLikeSchema,
    graphQlPostSchema,
    graphQlCompanySchema,
    graphQlSubscriptionSchema,
    graphQlBookingSchema
];

module.exports = schemaArray;