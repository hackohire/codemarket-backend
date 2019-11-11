const mongoose = require('mongoose');

const { Schema } = mongoose;

const bookingSchema = new Schema(
    {
        referenceId: {
            type: Schema.Types.ObjectId,
            ref: "post",
        },
        schedule: [String],
        expert: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        status: {
            type: String,
            enum: ['InvitationSent', 'Created', 'Drafted', 'Published', 'Unpublished', 'Submitted', 'Approved', 'Rejected', 'Archieved', 'Deleted'],
            default: 'InvitationSent'
        },

    },
    {
        timestamps: true,
        id: true,
    },
);

module.exports = () => {
    try {
        return mongoose.model('booking');
    } catch (e) {
        return mongoose.model('booking', bookingSchema);
    }

};