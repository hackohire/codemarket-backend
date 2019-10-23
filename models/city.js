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
        return mongoose.model('tag');
    } catch (e) {
        return mongoose.model('tag', citySchema);
    }

};