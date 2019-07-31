const mongoose = require('mongoose');
const { Schema } = mongoose;

const querySchema = new Schema(
    {
        question: String,
        description: String,
        price: Number,
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            // required: true
        },
        email: String,
        status: {
            type: String,
            enum: ['Created', 'Submitted', 'Approved', 'Rejected', 'Archieved', 'Deleted', 'Published', 'Unpublished', 'Resolved'],
            default: 'Created'
        }
    },
    {
        timestamps: true,
    },
);

module.exports = () => {
    try {
        return mongoose.model('query');
    } catch (e) {
        return mongoose.model('query', querySchema);
    }
};
