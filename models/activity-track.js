const mongoose = require('mongoose');

const { Schema } = mongoose;

const activitySchema = new Schema(
    {
        by: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        commentId: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        date: {
            type: Date,
        },
        action: {
            type: String,
            enum: ['addComment', 'addPost', 'updatePost', 'updateComment', 'deleteComment', 'deletePost', 'addCollaborator'],
            default: ''
        },

    },
    {
        timestamps: true,
        id: true,
    },
);

module.exports = () => {
    try {
        return mongoose.model('activity');
    } catch (e) {
        return mongoose.model('activity', activitySchema);
    }

};