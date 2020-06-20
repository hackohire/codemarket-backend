const graphQlUserSchema = require('./user');
const graphQlPostSchema = require('./post');
const graphQlSubscriptionSchema = require('./subscription');
const graphQlCompanySchema = require('./company');
const graphQlEmailSchema = require('./email');
const commentSchema = require('./comment');
const graphQlPostTypeSchema = require('./post-type');
const makemoneySchema = require('./MakeMoney');
const graphQlCampaignSchema = require('./campaign');
const graphQlVideoCallSchema = require('./videoCall');
const graphQlHelpBusinessGrowSchema = require('./temporary');
const schema = require('./schema');
const formJsonSchema = require('./FormJson');
const formDataSchema = require('./FormData');
const tweetSchema = require('./tweet');

const schemaArray = [
    schema,
    graphQlUserSchema,
    graphQlPostSchema,
    graphQlCompanySchema,
    graphQlSubscriptionSchema,
    graphQlEmailSchema,
    graphQlPostTypeSchema,
    commentSchema,
    makemoneySchema,
    graphQlCampaignSchema,
    commentSchema,
    formJsonSchema,
    formDataSchema,
    graphQlHelpBusinessGrowSchema,
    formJsonSchema,
    graphQlVideoCallSchema,
    tweetSchema
];

module.exports = schemaArray;