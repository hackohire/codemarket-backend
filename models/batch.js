const mongoose = require('mongoose');
const { Schema } = mongoose;


const batchSchema = new Schema(
    {
        
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        campaignId: {
            type: Schema.Types.ObjectId,
            ref: "campaign",
        },
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "company",
        },
        name: String
    },
    {
        timestamps: true,
        id: true,
    },
);

module.exports = () => {
    try {
        return mongoose.model('batch');
    } catch (e) {
        return mongoose.model('batch', batchSchema);
    }
};
