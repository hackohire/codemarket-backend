const mongoose = require('mongoose');
const { Schema } = mongoose;
const support = require('./support');


const companySchema = new Schema(
    {
        name: String,
        title: String,
        type: {
            type: String,
            enum: ['non-profit', 'local-business', 'startup'],
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
        howCanYouHelp: [new Schema({
            type: String,
            data: Schema.Types.Mixed,
        })],
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