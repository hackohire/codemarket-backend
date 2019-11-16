const mongoose = require('mongoose');
const { Schema } = mongoose;


const qestionAndAnswerSchema = new Schema(
    {

        /**  Id of a post(any type) & company */
        referenceId: {
            type: Schema.Types.ObjectId
        },
        answers: [{
            type: Schema.Types.ObjectId,
            ref: 'question-answer',
            default: []
        }],
        isQuestion: Boolean,
        isAnswer: Boolean,
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        type: {
            type: String,
            enum: ['post', 'company'],
            required: true
        },
        status: {
            type: String,
            enum: ['Created', 'Submitted', 'Approved', 'Rejected', 'Archieved', 'Deleted', 'Published', 'Unpublished', 'Resolved'],
            default: 'Created'
        },
        text: [Schema.Types.Mixed],
        questionId: {
            type: Schema.Types.ObjectId,
            ref: 'question-answer',
        }
    },
    {
        timestamps: true,
    },
);

module.exports = () => {
    try {
        return mongoose.model('question-answer');
    } catch (e) {
        return mongoose.model('question-answer', qestionAndAnswerSchema);
    }
};
