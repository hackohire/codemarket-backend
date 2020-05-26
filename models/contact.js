const mongoose = require('mongoose');
const { Schema } = mongoose;


const contactSchema = new Schema(
    {
        
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        
        status: {
            type: String,
            enum: ['Created', 'Drafted', 'Published', 'Unpublished', 'Submitted', 'Approved', 'Rejected', 'Archieved', 'Deleted'],
            default: 'Published'
        },

        /** Fields related to Contact */
        phone: [String],
        email: [{
            email: String,
            status: Boolean
        }],
        proposalName: String,
        OrganizationName: String,
        birthDate: String,
        address: String,
        website: String,
        companyName: String,
        url: String,
        cityName: String,
        followers: String,
        following: String,
        posts: String,
        instaProfileId: String,
        batch: String,
        descriptionHTML: String,
        companyContactEmail: String,
        conpanyContactPerson: String,
        ownerName: String


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
