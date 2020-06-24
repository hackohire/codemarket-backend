const mongoose = require('mongoose');
const { Schema } = mongoose;

const socialMediaSchema = new Schema(
    {
        content: String,
        type: {
            type: String,
            enum: ['twitter', 'facebook', 'linkedin'],
            default: ''
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "company"
        }
    },
    {
        timestamps: true,
        id: true,
    },
);

module.exports = () => {
    try {
        return mongoose.model('socialMedia');
    } catch (e) {
        return mongoose.model('socialMedia', socialMediaSchema);
    }

};