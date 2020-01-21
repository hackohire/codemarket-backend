const mongoose = require('mongoose');
const support = require('./support');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug, {truncate: 0});

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
            enum: ['product', 'help-request', 'requirement', 'interview', 'testing', 'howtodoc', 'design', 'goal', 'event', 'team-skill', 'dream-job', 'job'],
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
        jobProfile: [String],
        timeline: Number,

        slug: { type: String, slug: ['name', '_id'] },

        /** It will contain the url from where the post has been imported */
        referencePostUrl: String,


        /** referencePostId right now using it for storing the id of a dream-job as reference in a job post
         * Purpose is to connect jobs with dream-job
         */
        referencePostId: Schema.Types.ObjectId
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