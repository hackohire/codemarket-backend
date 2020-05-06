const graphQlUserSchema = require('./user');
const graphQlPurchaseSchema = require('./purchase');
const graphQlCartSchema = require('./cart');
const graphQlLikeSchema = require('./like');
const graphQlPostSchema = require('./post');
const graphQlSubscriptionSchema = require('./subscription');
const graphQlCompanySchema = require('./company');
const graphQlBookingSchema = require('./booking');
const graphQlQuestionAndAnswerSchema = require('./q&a');
const graphQlEmailSchema = require('./email');
const commentSchema = require('./comment');
const graphQlPostTypeSchema = require('./post-type');
const makemoneySchema = require('./MakeMoney');
const graphQlCampaignSchema = require('./campaign');
const graphQlHelpBusinessGrowSchema = require('./temporary');
const schema = require('./schema');
const formJsonSchema = require('./FormJson');
const formDataSchema = require('./FormData');

const schemaArray = [
    schema,
    graphQlUserSchema,
    graphQlPurchaseSchema,
    graphQlCartSchema,
    graphQlLikeSchema,
    graphQlPostSchema,
    graphQlCompanySchema,
    graphQlSubscriptionSchema,
    graphQlQuestionAndAnswerSchema,
    graphQlBookingSchema,
    graphQlEmailSchema,
    graphQlPostTypeSchema,
    commentSchema,
    makemoneySchema,
    graphQlCampaignSchema,
    commentSchema,
    formJsonSchema,
    formDataSchema,
    graphQlHelpBusinessGrowSchema
];

module.exports = schemaArray;