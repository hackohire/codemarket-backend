const mongoose = require('mongoose');
const { Schema } = mongoose;

const dbUrlSchema = new Schema(
    {
        name: { type: String },
        mongoUrl: {
            type: String
        },
    }
);

module.exports = () => {
    try {
        return mongoose.model('dburl');
    } catch (e) {
        return mongoose.model('dburl', dbUrlSchema);
    }

};
