const mongoose = require('mongoose');
const { Schema } = mongoose;

const quoteSchema = new Schema(
    {
        firstName: String,
        email: String,
        phone: String,
        InsuranceType: String,
        description: String
    },
    {
        timestamps: true, /** Will automatically create, createdAt & updatedAt fields */
    },
);

module.exports = () => {
    try {
        return mongoose.model('quote');
    } catch (e) {
        return mongoose.model('quote', quoteSchema);
    }
};