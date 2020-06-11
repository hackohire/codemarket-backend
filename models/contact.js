const mongoose = require('mongoose');
const { Schema } = mongoose;

const contactSchema = new Schema(
    {
        
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        batchId: {
            type: Schema.Types.ObjectId,
            ref: "batch",
        },
        campaignId: {
            type: Schema.Types.ObjectId,
            ref: "campaign",
        },
        status: {
            type: String,
            enum: ['Created', 'Drafted', 'Published', 'Unpublished', 'Submitted', 'Approved', 'Rejected', 'Archieved', 'Deleted'],
            default: 'Published'
        },

        /** Fields related to Contact */
        isEmailSent: {
            type: Boolean,
            default: false
        },
        phone: [String],
        email: [{
            email: String,
            status: String
        }],
        proposalName: String,
        OrganizationName: String,
        birthDate: String,
        address: String,
        website: String,
        companyName: String,
        url: String,
        firstName: String,
        lastName: String,
        cityName: String,
        name: String,
        followers: String,
        following: String,
        posts: String,
        instaProfileId: String,
        batch: String,
        descriptionHTML: String,
        companyContactEmail: String,
        conpanyContactPerson: String,
        ownerName: String,
        instagramUrl: String,
        tweetUrl: String,
        fbUrl: String,
        occupation: String,
        location: String,
        country: String,
        experience: [String],
        skills: [String],
        education: [String],
    },
    {
        timestamps: true,
        id: true,
    },
);

module.exports = () => {
    try {
        return mongoose.model('contact');
    } catch (e) {
        return mongoose.model('contact', contactSchema);
    }
};
