const mongoose = require('mongoose');
const { Schema } = mongoose;

const quoteSchema = new Schema(
    {
        name: String,
        email: String,
        zipCode: String,
        age: String,
        sex: String,
        coverageAmount: String,
        termLength: String,
        healthLevel: String
    },
    {
        timestamps: true,
    },
);

module.exports = () => {
    try {
        return mongoose.model('quote');
    } catch (e) {
        return mongoose.model('quote', quoteSchema);
    }
};