const mongoose = require('mongoose');
const { Schema } = mongoose;


const twitSchema = new Schema(
    {
        content : String,
    },

   
);

module.exports = () => {
    try {
        return mongoose.model('twit');
    } catch (e) {
        return mongoose.model('twit', twitSchema);
    }
};
 