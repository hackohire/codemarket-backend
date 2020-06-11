const mongoose = require('mongoose');
const { Schema } = mongoose;

const formDataSchema = new Schema(
    {
        formname: String,
        formDataJson: Object,
        connectedFormStructureId: {
            type: Schema.Types.ObjectId,
            ref: "form-structure",
        },
        company: {
            type: Schema.Types.ObjectId,
            ref: "company",
        },
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