const mongoose = require('mongoose');
const { Schema } = mongoose;

const formJsonSchema = new Schema(
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
        return mongoose.model('formJson');
    } catch (e) {
        return mongoose.model('formJson', formJsonSchema);
    }
};