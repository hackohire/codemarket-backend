const mongoose = require('mongoose');
const support = require('./support');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug, { truncate: 0 });

const { Schema } = mongoose;

const postSchema = new Schema(
    {
        name: String,
        description: [new Schema({
            type: String,
            data: Schema.Types.Mixed,
        })],
        type: {
            type: String,
            enum: [
                'product', 'help-request', 'requirement', 'interview', 'testing', 'howtodoc', 'design', 'goal', 'event', 'team-skill', 'dream-job', 'job', 'career-coach', 'business-coach', 'capital-funding', 'hiring-process',
                'leadership-goal',        /** user profile post type */
                'startup-goal',           /** user profile post type */
                'social-impact-goal',           /** user profile post type */

                'leadership-challenge',   /** user profile post type */

                'sales-challenge',        /** company post type */
                'marketing-challenge',    /** company post type */
                'technical-challenge',    /** company post / user type */
                'business-challenge',     /** company / user post type */
                'team-challenge',         /** company post type */
                'sales-goal',             /** company post type */
                'marketing-goal',         /** company post type */
                'technical-goal',         /** company / user post type */
                'business-goal',          /** company / user post type */
                'team-goal',              /** company post type */
                'mission',                /** company post type */
                'company-post'            /** company post type */
            ],
        },
        featuredImage: String,
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        price: Number,
        categories: [],
        status: {
            type: String,
            enum: ['Created', 'Drafted', 'Published', 'Unpublished', 'Submitted', 'Approved', 'Rejected', 'Archieved', 'Deleted'],
            default: 'Created'
        },
        tags: [{
            type: Schema.Types.ObjectId,
            ref: "tag",
        }],
        support: support,
        isPostUnderCompany: Boolean,
        connectedWithUser: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        isPostUnderUser: Boolean,

        /** Event Specific Fields */
        dateRange: [String],
        address: String,
        location: new Schema({
            latitude: Number,
            longitude: Number,
            address: String,
            additionalLocationDetails: String
        }),
        eventType: {
            type: String,
            enum: ['hackathon', 'dreamjob', 'interview-workshop', 'mock-interview', 'business'],
            // default: ''
        },
        membershipRequired: {
            type: Boolean,
            default: false
        },
        usersAttending: [{
            type: Schema.Types.ObjectId,
            ref: "user",
        }],

        /** Dreamjob Specific Fields */
        cities: [{
            type: Schema.Types.ObjectId,
            ref: "city",
        }],
        company: {
            type: Schema.Types.ObjectId,
            ref: "company",
        },
        companies: [{
            type: Schema.Types.ObjectId,
            ref: "company",
        }],
        salaryCurrency: String,
        salaryRangeFrom: Number,
        salaryRangeTo: Number,
        jobProfile: [{
            type: Schema.Types.ObjectId,
            ref: "tag",
        }],
        timeline: Number,

        slug: { type: String, slug: ['name', '_id'] },

        /** It will contain the url from where the post has been imported */
        referencePostUrl: String,


        /** referencePostId right now using it for storing the id of a dream-job as reference in a job post
         * Purpose is to connect jobs with dream-job
         */
        referencePostId: Schema.Types.ObjectId,

        /** Fields only for type 'career-coach' */
        gapAnalysis: Boolean,
        careerCoachSessions: Boolean,
        helpingWithMockInterviews: Boolean,
        hiringMentoringSessions: Boolean,

        /** Fields only for type 'business-coach' */
        businessCoachSessions: Boolean,
        businessAreas: [{
            type: Schema.Types.ObjectId,
            ref: "tag",
        }],
        businessGoals: [{
            type: Schema.Types.ObjectId,
            ref: "tag",
        }],
        businessChallenges: [{
            type: Schema.Types.ObjectId,
            ref: "tag",
        }],
        sellProducts: {
            sellProducts: Boolean,
            products: [{
                type: Schema.Types.ObjectId,
                ref: "tag",
            }],
        },
        sellServices: {
            sellServices: Boolean,
            services: [{
                type: Schema.Types.ObjectId,
                ref: "tag",
            }],
        },

        /** Fields related to post type 'capital-funding' */
        fundingCurrency: String,
        fundingAmount: Number,
        fundingBy: [{
            type: Schema.Types.ObjectId,
            ref: "company",
        }],
        fundingTo: [{
            type: Schema.Types.ObjectId,
            ref: "company",
        }],
        fundingDate: String,
        fundingProcess: [[new Schema({
            type: String,
            data: Schema.Types.Mixed,
        })]],


        /** Field Related to hiring process */
        hiringProcess: [[new Schema({
            type: String,
            data: Schema.Types.Mixed,
        })]],

    },
    {
        timestamps: true,
        id: true,
    },
);

postSchema.on('index', function (err) {
    if (err) {
        console.error('User index error: %s', err);
    } else {
        console.info('User indexing complete');
    }
});

// postSchema.index({'name': 'text', 'type': 'text', 'description.data.text': 'text' }, {
//     "language_override": "javascript"
// });




module.exports = () => {
    try {
        return mongoose.model('post');
    } catch (e) {
        return mongoose.model('post', postSchema);
    }

};