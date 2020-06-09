const mongoose = require('mongoose');
const { Schema } = mongoose;


const commentSchema = new Schema(
    {
        parentId: {
            type: Schema.Types.ObjectId,
            default: null
        },

        /** reference Id */
        referenceId: {
            type: Schema.Types.ObjectId,
            // ref: 'post'
        },
        /** User reference ID for the comments added under the posts created in user's profile */
        userReferenceId: Schema.Types.ObjectId,
        companyReferenceId: Schema.Types.ObjectId,
        children: [{
            type: Schema.Types.ObjectId,
            ref: 'comment',
            default: []
        }],
        parents: [{
            type: Schema.Types.ObjectId,
            ref: 'comment',
            default: []
        }],
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
            // required: true
        },
        type: {
            type: String,
            enum: ['post', 'product', 'company', 'dream-job'],
        },
        status: {
            type: String,
            enum: ['Created', 'Submitted', 'Approved', 'Rejected', 'Archieved', 'Deleted', 'Published', 'Unpublished', 'Resolved'],
            default: 'Created'
        },
        text: [new Schema({
            type: String,
            data: Schema.Types.Mixed,
        })],

        /** Fileds Related to the comments in specific block in the post */
        blockSpecificComment: {
            type: Boolean,
            default: false
        },
        blockId: Schema.Types.ObjectId,

        textHTML: String
    },
    {
        timestamps: true,
    },
);

module.exports = () => {
    try {
        return mongoose.model('comment');
    } catch (e) {
        return mongoose.model('comment', commentSchema);
    }
};
