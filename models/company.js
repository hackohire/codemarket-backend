const mongoose = require('mongoose');
const { Schema } = mongoose;


const companySchema = new Schema(
    {
        name: String,
        cover: String,
        type: {
            type: String,
            enum: ['non-profit', 'local-business', 'startup', 'smb', 'school', 'government', ''],
            default: ''
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
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
        posts: [
            new Schema(
                {
                    description: [new Schema({
                        type: String,
                        data: Schema.Types.Mixed,
                    })],
                    postType: {
                        type: String,
                        enum: ['sales-challenge', 'marketing-challenge', 'technical-challenge', 'business-challenge', 'team-challenge', 'sales-goal', 'marketing-goal', 'technical-goal', 'business-goal', 'team-goal', 'mission', 'post'],
                        default: ''
                    },
                    createdBy: {
                        type: Schema.Types.ObjectId,
                        ref: "user",
                    },
                    default: [],
                },
                {
                    timestamps: true,
                    id: true,
                }
            )
        ]
    },
    {
        timestamps: true,
        id: true,
    },
);

// companySchema.index({'name': 'text', }, {
//     "language_override": "javascript"
// });

module.exports = () => {
    try {
        return mongoose.model('company');
    } catch (e) {
        return mongoose.model('company', companySchema);
    }

};