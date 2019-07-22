const mongoose = require('mongoose');
const { Schema } = mongoose;

const priceAndFiles = new Schema(
    {
        fileName: String,
        file: String,
        price: Number
    }
);


const productSchema = new Schema(
    {
        name: String,
        description: String,
        shortDescription: String,
        featuredImage: String,
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            // required: true
        },
        priceAndFiles: [priceAndFiles],
        totalPrice: Number,
        categories: [],
        demo_url: String,
        documentation_url: String,
        video_url: String,
        status: {
            type: String,
            enum: ['Created', 'Drafted', 'Submitted', 'Approved', 'Rejected', 'Archieved', 'Deleted'],
            default: 'Created'
        }
    },
    {
        timestamps: true,
        id: true
    },
);



module.exports = () => {
    try {
        return mongoose.model('product');
    } catch (e) {
        return mongoose.model('product', productSchema);
    }

};
