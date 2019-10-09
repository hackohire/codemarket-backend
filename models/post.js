const mongoose = require('mongoose');
const { Schema } = mongoose;
const support  = require('./support');


const postSchema = new Schema(
    {
        name: String,
        description: [],
        shortDescription: String,
        type: {
            type: String,
            enum: ['product', 'help-request', 'requirement', 'interview', 'testing', 'howtodoc', 'design', 'goal', 'event', 'team-skill'],
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
        eventType: String,
        usersAttending: [{
                type: Schema.Types.ObjectId,
                ref: "user",
            }]
    },
    {
        timestamps: true,
        id: true
    },
);



module.exports = () => {
    try {
        return mongoose.model('post');
    } catch (e) {
        return mongoose.model('post', postSchema);
    }

};