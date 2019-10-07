const mongoose = require('mongoose');
const { Schema } = mongoose;

const transactionSchema = new Schema(
    {
        purchase_id: String,
        subscription: {
            type: Schema.Types.ObjectId,
            ref: "subscription",
        },
        purchasedBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
            // required: true
        },

        purchase_units: [{
            type: Schema.Types.ObjectId,
            ref: "purchasedItem",
        }],
        sessionId: String,
        // documentation_url: String,
        // video_url: String,
        status: String,
    },
    {
        timestamps: true,
        id: true
    },
);



module.exports = () => {
    try {
        return mongoose.model('transaction');
    } catch (e) {
        return mongoose.model('transaction', transactionSchema);
    }

};
