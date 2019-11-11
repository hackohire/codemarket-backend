const mongoose = require('mongoose');
const { Schema } = mongoose;


const commentSchema = new Schema(
    {
        parentId: {
            type: Schema.Types.ObjectId,
            default: null
        },

        /**  Id of a product | help-request | requirement | interview | goal | design | howtodoc | testing | event */
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
            enum: ['post', 'company'],
        },
        status: {
            type: String,
            enum: ['Created', 'Submitted', 'Approved', 'Rejected', 'Archieved', 'Deleted', 'Published', 'Unpublished', 'Resolved'],
            default: 'Created'
        },
        text: [],

        /** Fileds Related to the comments in specific block in the post */
        blockSpecificComment: {
            type: Boolean,
            default: false
        },
        blockId: Schema.Types.ObjectId
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
