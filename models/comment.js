const mongoose = require('mongoose');
const { Schema } = mongoose;


const commentSchema = new Schema(
    {
        parentId: {
            type: Schema.Types.ObjectId,
            default: null
        },

        /**  Id of a post | product | company*/
        referenceId: {
            type: Schema.Types.ObjectId
        },
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
            enum: ['post', 'product', 'company'],
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

        /** Field Related to company */
        postId: Schema.Types.ObjectId /** Company Id */
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
