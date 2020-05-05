const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug, { truncate: 0 });

const { Schema } = mongoose;

const helpBusinessGrow = new Schema(
    {
        businessName: String,
        email: String,
        firstName: String,
        website: String,
        lastName: String,
        mobileNumber: String,
        city: String,
        businessAreas: [{
            type: Schema.Types.ObjectId,
            ref: "tag",
        }],
    },
    {
        timestamps: true,
        id: true,
    },
);

module.exports = () => {
    try {
        return mongoose.model('help-business-grow');
    } catch (e) {
        return mongoose.model('help-business-grow', helpBusinessGrow);
    }
};