const mongoose = require('mongoose');
const { Schema } = mongoose;

const snippet = new Schema(
    {
        language: String,
        r: Number,
        second_best: {},
        top: {},
        value: String
    }
);


const querySchema = new Schema(
    {
        question: String,
        description: [],
        price: Number,
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
            // required: true
        },
        email: String,
        status: {
            type: String,
            enum: ['Created', 'Submitted', 'Approved', 'Rejected', 'Archieved', 'Deleted', 'Published', 'Unpublished', 'Resolved'],
            default: 'Created'
        },
        categories: { type: Array, default: [] },
        demo_url: String,
        documentation_url: String,
        video_url: String,
        snippets: [snippet],
        shortDescription: String,
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
