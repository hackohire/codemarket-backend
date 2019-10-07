const mongoose = require('mongoose');
const { Schema } = mongoose;


const SubscriptionSchema = new Schema(
    {
        customer: String,
        amount: Number,
        start_date: Number,
        current_period_start: Number,
        current_period_end: Number,
        metadata: {
            userId: {
                type: Schema.Types.ObjectId,
                ref: "user",
            },
            email: String
        },
        quantity: Number,
        plan: new Schema({
            active: Boolean,
            amount: Number,
            nickname: String
        }),
        status: String,
        subscriptionUsers: [{
            name: String,
            email: String
        }]
    },
    {
        id: true,
        timestamps: true
    }
)

module.exports = () => {
    try {
        return mongoose.model('stripe_subscription');
    } catch (e) {
        return mongoose.model('stripe_subscription', SubscriptionSchema);
    }
};