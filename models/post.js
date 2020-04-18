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
            data: {
                text: String,
                level: Number,
                code: String,
                language: String,

                caption: String,
                stretched: Boolean,
                withBackground: Boolean,
                withBorder: Boolean,

                style: String,
                items: [String],

                alignment: String,

                content: [[String]],

                title: String,
                message: String,

                service: String,
                source: String,
                embed: String,
                width: Number,
                height: Number,

                link: String,
                meta: {
                    title: String,
                    description: String,
                    domain: String,
                    url: String,
                    image: {
                        url: String
                    }
                },
                file: {
                    url: String,
                    name: String,
                    size: Number,
                    extension: String
                },
                createdBy: {
                    type: Schema.Types.ObjectId,
                    ref: "user", 
                }
            },
            status: {
                type: String,
                enum: ['Completed']
            }
        })],
        type: {
            type: String,
            enum: [
                'product', 'help-request', 'requirement', 'interview', 'testing', 'howtodoc', 'goal', 'event', 'dream-job', 'job', 'bug',

                'competitive-advantage',   /** company post type */

                'business',

                'class',

                'service',

                'challenge',

                'assignment',

                'contact',

                'note',

                'question',

                'email'                  /** Post type for Email */
            ],
        },
        featuredImage: String,
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        users: [{
            type: Schema.Types.ObjectId,
            ref: "user",
        }],
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

        /** Event Specific Fields */
        dateRange: [String],

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
        cover: String,

        /** Dreamjob Specific Fields */
        cities: [{
            type: Schema.Types.ObjectId,
            ref: "city",
        }],
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

        /** Array of ID of posts, a post is tied to */
        connectedPosts: [{
            type: Schema.Types.ObjectId,
            ref: "post",
        }],

        collaborators: [{
            type: Schema.Types.ObjectId,
            ref: "user",
        }],
        assignees: [{
            type: Schema.Types.ObjectId,
            ref: "user",
        }],

        /** Storing Email Id in this field to connect email with the post */
        connectedEmail: Schema.Types.ObjectId,

        /** Fields related to Contact */
        phone: [String],
        email: [String],
        birthDate: String,
        address: String,
        website: String,

        descriptionHTML: String


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