const mongoose = require('mongoose');
const support = require('./support');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug, { truncate: 0 });

const { Schema } = mongoose;

const postSchema = new Schema(
    {
        name: String,
        type: {
            type: String,
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

        location: new Schema({
            latitude: Number,
            longitude: Number,
            address: String,
            additionalLocationDetails: String
        }),

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

        /** Storing Email Id in this field to connect email with the post */
        connectedEmail: Schema.Types.ObjectId,

        /** Fields related to Contact */
        phone: [String],
        email: [String],
        birthDate: String,
        address: String,
        website: String,

        descriptionHTML: String,

        /** Add Fields Related to the new post types here */
        appointment_date: String,
        cancelReason: String,
        duration: [String],

        formStrucutreJSON: Object,
        
        mentor: {
            topics: [{
                type: Schema.Types.ObjectId,
                ref: "tag",
                autopopulate: true
            }],
            duration: [String],
            availabilityDate: String,
        },

        job: {
            jobProfile: [{
                type: Schema.Types.ObjectId,
                ref: "tag",
                autopopulate: true
            }],
        }

    },
    {
        timestamps: true,
        id: true,
    },
);

postSchema.plugin(require('mongoose-autopopulate'));

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