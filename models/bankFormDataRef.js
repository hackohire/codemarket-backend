const mongoose = require('mongoose');
const { Schema } = mongoose;

const bankFormDataRefSchema = new Schema(
    {
        formname: String,
        connectedFormStructureId: 
         {
            type: Schema.Types.ObjectId,
            ref: "form-structure",
        },
        connectedFormDataId: {
            type: Schema.Types.ObjectId,
            ref: "formData",
        },
        companyName: String
    },
    {
        timestamps: true, /** Will automatically create, createdAt & updatedAt fields */
    },
);

module.exports = () => {
    try {
        return mongoose.model('bankFormDataRef');
    } catch (e) {
        return mongoose.model('bankFormDataRef', bankFormDataRefSchema);
    }
};