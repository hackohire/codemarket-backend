const mongoose = require('mongoose');
const { Schema } = mongoose;


const contactSchema = new Schema(
    {
        name: String,
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
        clients: [{
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
        email: [{
            email: String,
            status: Boolean
        }],
        proposalName: String,
        OrganizationName: String,
        birthDate: String,
        address: String,
        website: String,
        companyName: String,
        url: String,
        cityName: String,
        instaProfileId: String,
        batch: String,
        descriptionHTML: String,
        companyContactEmail: String,
        conpanyContactPerson: String,
        ownerName: String


    },
    {
        timestamps: true,
        id: true,
    },
);

module.exports = () => {
    try {
        return mongoose.model('cartitem');
    } catch (e) {
        return mongoose.model('cartitem', contactSchema);
    }
};
