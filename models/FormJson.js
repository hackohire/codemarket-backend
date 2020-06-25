const mongoose = require('mongoose');
const { Schema } = mongoose;

const formJsonSchema = new Schema(
    {
        formname: String,
        formStructureJSON: Object,
        connectedDB: {
            type: Schema.Types.ObjectId,
            ref: "dburl",
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
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