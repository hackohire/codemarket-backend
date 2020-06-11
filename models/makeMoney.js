const mongoose = require('mongoose');
const { Schema } = mongoose;

const makeMoneySchema = new Schema(
    {
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        haveBusiness: String,
        describeBusiness: String,
        WebsiteLink: String,
        businessAddress: String
    },
    {
        timestamps: true, /** Will automatically create, createdAt & updatedAt fields */
    },
);

module.exports = () => {
    try {
        return mongoose.model('makeMoney');
    } catch (e) {
        return mongoose.model('makeMoney', makeMoneySchema);
    }
};