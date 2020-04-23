const mongoose = require('mongoose');
const { Schema } = mongoose;

const contactSchema = new Schema(
    {
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        address: String,
        showDate: Date
    },
    {
        timestamps: true, /** Will automatically create, createdAt & updatedAt fields */
    },
);

module.exports = () => {
    try {
        return mongoose.model('contact');
    } catch (e) {
        return mongoose.model('contact', contactSchema);
    }
};