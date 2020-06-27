const mongoose = require('mongoose');

const { Schema } = mongoose;

const bookingSchema = new Schema(
    {
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        status: {
            type: String,
        },

        transactionId: {
            type: Schema.Types.ObjectId,
            ref: "transactions",
        },

        duration: [String, String],
        date: String,

        /** ID of post, a booking is tied to */
        referencePost: {
            type: Schema.Types.ObjectId,
            ref: "post",
        },

    },
    {
        timestamps: true,
        id: true,
    },
);

bookingSchema.plugin(require('mongoose-autopopulate'));

bookingSchema.on('index', function (err) {
    if (err) {
        console.error('User index error: %s', err);
    } else {
        console.info('User indexing complete');
    }
});

module.exports = () => {
    try {
        return mongoose.model('booking');
    } catch (e) {
        return mongoose.model('booking', bookingSchema);
    }

};