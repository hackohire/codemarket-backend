const mongoose = require('mongoose');
const { Schema } = mongoose;

const formJsonSchema = new Schema(
    {
        formname: String,
        formStructureJSON: Object
    },
    {
        timestamps: true, /** Will automatically create, createdAt & updatedAt fields */
    },
);

module.exports = () => {
    try {
        return mongoose.model('form-structure');
    } catch (e) {
        return mongoose.model('form-structure', formJsonSchema);
    }
};