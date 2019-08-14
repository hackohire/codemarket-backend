const mongoose = require('mongoose');
const { Schema } = mongoose;

const requirementSchema = new Schema(
    {
        name: String,
        description: [],
        shortDescription: String,
        featuredImage: String,
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
            // required: true
        },
        // priceAndFiles: [priceAndFiles],
        totalPrice: Number,
        categories: [],
        demo_url: String,
        // documentation_url: String,
        // video_url: String,
        status: {
            type: String,
            enum: ['Created', 'Drafted', 'Submitted', 'Approved', 'Rejected', 'Archieved', 'Deleted'],
            default: 'Created'
        },
        // snippets: [snippet],
        // addedToCart: Boolean
    },
    {
        timestamps: true,
        id: true
    },
);



module.exports = () => {
    try {
        return mongoose.model('requirement');
    } catch (e) {
        return mongoose.model('requirement', requirementSchema);
    }

};
