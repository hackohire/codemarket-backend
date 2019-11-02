const mongoose = require('mongoose');
const { Schema } = mongoose;


const purchasedItemSchema = new Schema(
    {
        name: String,
        sessionId: String,
        reference_id: {
            type: Schema.Types.ObjectId, // Bugfix Id
            ref: "post",
            required: true
        },
        purchasedBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        transactionId: {
            type: Schema.Types.ObjectId,
            ref: "transaction"
        },
        amount: Number,
        status: String,
    },
    {
        timestamps: true,
        id: true
    },
);



module.exports = () => {
    try {
        return mongoose.model('purchasedItem');
    } catch (e) {
        return mongoose.model('purchasedItem', purchasedItemSchema);
    }

};
