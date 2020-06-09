const mongoose = require('mongoose');
const { Schema } = mongoose;

const tagsSchema = new Schema(
    {
        name: { type: String },
        type: {
            type: String,
            enum: ['role', 'product', ''],
            default: ''
        },
    }
);

module.exports = () => {
    try {
        return mongoose.model('tag');
    } catch (e) {
        return mongoose.model('tag', tagsSchema);
    }

};
