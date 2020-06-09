const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug, { truncate: 0 });
const { Schema } = mongoose;


const campaignSchema = new Schema(
    {
        
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        batchId: {
            type: Schema.Types.ObjectId,
            ref: "batch",
        },
        name: String,
        from: String,
        descriptionHTML: String,
        subject: String,
        companies: [{
            type: Schema.Types.ObjectId,
            ref: "company",
        }],
        label: { type: String, slug: 'name' },
    },
    {
        timestamps: true,
        id: true,
    },
);

module.exports = () => {
    try {
        return mongoose.model('campaign');
    } catch (e) {
        return mongoose.model('campaign', campaignSchema);
    }
};
