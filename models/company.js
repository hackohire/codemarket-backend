const mongoose = require('mongoose');
const { Schema } = mongoose;
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug, { truncate: 0 });

const companySchema = new Schema(
    {
        name: String,
        cover: String,
        slug: { type: String, slug: 'name' },
        type: {
            type: String,
            enum: ['non-profit', 'local-business', 'startup', 'smb', 'school', 'government', ''],
            default: ''
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        owners: [{
            type: Schema.Types.ObjectId,
            ref: "user",
        }],
        status: {
            type: String,
            enum: ['Created', 'Drafted', 'Published', 'Unpublished', 'Submitted', 'Approved', 'Rejected', 'Archieved', 'Deleted'],
            default: 'Created'
        },
        cities: [{
            type: Schema.Types.ObjectId,
            ref: "city",
        }],
        description: [new Schema({
            type: String,
            data: Schema.Types.Mixed,
        })],
        questions: [new Schema({
            type: String,
            data: Schema.Types.Mixed,
        })],
        ideas: [new Schema({
            type: String,
            data: Schema.Types.Mixed,
        })],
        location: new Schema({
            latitude: Number,
            longitude: Number,
            address: String,
            additionalLocationDetails: String
        }),
        websiteLink: String,
        facebookLink: String,
        instagramLink: String,
        twitterLink: String,
        yelpLink: String,
        linkedinLink: String,
    },
    {
        timestamps: true,
        id: true,
    },
);

companySchema.index({'name': 'text', }, {
    "language_override": "javascript"
});

module.exports = () => {
    try {
        return mongoose.model('company');
    } catch (e) {
        return mongoose.model('company', companySchema);
    }

};