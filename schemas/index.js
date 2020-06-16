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
const graphQlAddSurveyUserSchema = require('./temporary');
const schema = require('./schema');
const contactSchema = require('./contact');
const formJsonSchema = require('./FormJson');
const formDataSchema = require('./FormData');
const bankFormDataRef = require('./bankFormDataRef');
const homeBuyerProgram = require('./homeBuyerProgram');

const schemaArray = [
    schema,
    graphQlUserSchema,
    graphQlPostSchema,
    graphQlCompanySchema,
    graphQlSubscriptionSchema,
    graphQlEmailSchema,
    graphQlPostTypeSchema,
    commentSchema,
    contactSchema,
    makemoneySchema,
    graphQlCampaignSchema,
    commentSchema,
    formJsonSchema,
    formDataSchema,
    graphQlAddSurveyUserSchema,
    graphQlVideoCallSchema
];

module.exports = schemaArray;