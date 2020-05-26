const mongoose = require('mongoose');
const { Schema } = mongoose;


const emailSchema = new Schema(
    {
        from: String,
        to: Array,
        cc: Array,
        bcc: Array,
        subject: String,
        description: [new Schema({
            type: String,
            data: Schema.Types.Mixed,
        })],
        descriptionHTML: String,
        status: String,
        type: {
            type: String,
            enum: ['email'],
            default: ''
        },
        campaignId: Schema.Types.ObjectId,
        dateRange: [String],
        companies: [{
            type: Schema.Types.ObjectId,
            ref: "company",
        }],
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        tracking: {
            type: Array,
            default: []
        }
    },
    {
        timestamps: true,
        id: true,
    },
);

module.exports = () => {
    try {
        return mongoose.model('email');
    } catch (e) {
        return mongoose.model('email', emailSchema);
    }

};