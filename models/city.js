const mongoose = require('mongoose');
const { Schema } = mongoose;

const citySchema = new Schema(
    {
        name: { type: String },
        country: {
            type: String,
            default: ''
        }
    }
);

module.exports = () => {
    try {
        return mongoose.model('city');
    } catch (e) {
        return mongoose.model('city', citySchema);
    }

};