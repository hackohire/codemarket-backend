const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug, { truncate: 0 });

const { Schema } = mongoose;

const postSchema = new Schema(
    {
        name: String,
        description: [new Schema({
            type: String,
            data: Schema.Types.Mixed,
            status: {
                type: String,
                enum: ['Completed']
            }
        })],
        type: {
            type: String,
            enum: [
                'requirements', 'testing', 'interview', 'goal', 'assignment', 'event', 'class', 'assignment', 'how-to-doc', 'interview-steps',
                'bug', 'product', 'service', 'competitive-advantage', 'service', 'challenge', 'email'
            ],
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        // price: Number,

        status: {
            type: String,
            enum: ['Created', 'Drafted', 'Published', 'Unpublished', 'Submitted', 'Approved', 'Rejected', 'Archieved', 'Deleted'],
            default: 'Created'
        },

        tags: [{
            type: Schema.Types.ObjectId,
            ref: "tag",
        }],

        /** Goal specific field */
        goalType: {
            type: String,
            enum: ['business', 'daily', 'team', 'marketing', 'sales', 'tech'],
        },

        /** Event Specific Fields */
        dateRange: [String],
        address: String,
        eventType: {
            type: String,
            enum: ['class'],
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



        /** Storing Email Id in this field to connect email with the post */
        connectedEmail: Schema.Types.ObjectId

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