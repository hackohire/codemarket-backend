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
        activityDate: {
            type: Date,
        },
        action: {
            type: String,
            enum: ['ADD_COMMENT', 'ADD_POST', 'UPDATE_POST', 'UPDATE_COMMENT', 'DELETE_COMMENT', 'DELETE_POST', 'ADD_COLLABORATOR'],
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