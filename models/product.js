const mongoose = require('mongoose');
const { Schema } = mongoose;
const support  = require('./support');

var slug = require('mongoose-slug-updater');

mongoose.plugin(slug, {truncate: 0});

const productSchema = new Schema(
    {
        name: String,
        type: {
            type: String,
            default: 'product'
        },
        description: [],
        shortDescription: String,
        featuredImage: String,
        parentId: Schema.Types.ObjectId,
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
            // required: true
        },
        price: Number,
        categories: [],
        demo_url: String,
        documentation_url: String,
        video_url: String,
        status: {
            type: String,
            enum: ['Created',  'Drafted', 'Published', 'Unpublished', 'Submitted', 'Approved', 'Rejected', 'Archieved', 'Deleted'],
            default: 'Drafted'
        },
        tags: [{
            type: Schema.Types.ObjectId,
            ref: "tag",
        }],
        support: {
            type: support,
            default: null
        },
        comments: [{
            type: Schema.Types.ObjectId,
            ref: "comment", 
        }],
        slug: { type: String, slug: ['name', '_id'] }
        // addedToCart: Boolean
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
