const mongoose = require('mongoose');
const { Schema } = mongoose;

const formJsonSchema = new Schema(
    {
        formname: String,
        formStructureJSON: Object,
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        commonId: {
            type: Schema.Types.ObjectId
        }
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