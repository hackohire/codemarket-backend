const mongoose = require('mongoose');
const { Schema } = mongoose;

const contactSchema = new Schema(
    {
        name: String,
        email: String,
        subject: String,
        description: String
    },
    {
        timestamps: true,
        id: true,/** Will automatically create, createdAt & updatedAt fields */
    },
);

module.exports = () => {
    try {
        return mongoose.model('contact');
    } catch (e) {
        return mongoose.model('contact', contactSchema);
    }
};