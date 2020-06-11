const mongoose = require('mongoose');
const { Schema } = mongoose;

const homeBuyerProgramSchema = new Schema(
    {
        title: String,
        location: String,
        benefits: [String],
        featuredLenderLink: String,
        websiteLink: String
    },
    {
        timestamps: true, /** Will automatically create, createdAt & updatedAt fields */
    },
);

module.exports = () => {
    try {
        return mongoose.model('homeBuyerProgram');
    } catch (e) {
        return mongoose.model('homeBuyerProgram', homeBuyerProgramSchema);
    }
};