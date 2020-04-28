const mongoose = require('mongoose');
const { Schema } = mongoose;

const formDataSchema = new Schema(
    {
        formname: String,
        jsonstring: String
    },
    {
        timestamps: true, /** Will automatically create, createdAt & updatedAt fields */
    },
);

module.exports = () => {
    try {
        return mongoose.model('formData');
    } catch (e) {
        return mongoose.model('formData', formDataSchema);
    }
};