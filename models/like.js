const mongoose = require('mongoose');
const { Schema } = mongoose;


const likeSchema = new Schema(
    {
        /**  Id of a product | help-request | requirement | interview | goal | design | howtodoc | testing | event */
        referenceId: {
            type: Schema.Types.ObjectId
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "user",
            // required: true
        },
        type: {
            type: String,
            enum: ['user', 'product', 'help-request', 'requirement', 'interview', 'testing', 'design', 'howtodoc', 'goal', 'event', 'team-skill', 'dream-job'],
        },
    },
    {
        timestamps: true,
    },
);

module.exports = () => {
    try {
        return mongoose.model('like');
    } catch (e) {
        return mongoose.model('like', likeSchema);
    }
};
