const mongoose = require('mongoose');
const { Schema } = mongoose;


const paypalSubscriptionSchema = new Schema(
    {
        status: {
            type: String
        },
        purchasedBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
            // required: true
        },
        status_update_time: {
            type: Date
        },
        status_changed_by: {
            type: String
        },
        id: {
            type: String
        },
        plan_id: {
            type: String
        },
        start_time: {
            type: Date
        },
        quantity: {
            type: Date
        },
        shipping_amount: {
            currency_code: {
                type: String
            },
            value: {
                type: String
            }
        },
        subscriber: {
            name: {
                given_name: {
                    type: String
                },
                surname: {
                    type: String
                }
            },
            email_address: {
                type: String
            },
            shipping_address: {
                address: {
                    address_line_1: {
                        type: String
                    },
                    address_line_2: {
                        type: String
                    },
                    admin_area_2: {
                        type: String
                    },
                    admin_area_1: {
                        type: String
                    },
                    postal_code: {
                        type: Date
                    },
                    country_code: {
                        type: String
                    }
                }
            }
        },
        billing_info: {
            outstanding_balance: {
                currency_code: {
                    type: String
                },
                value: {
                    type: String
                }
            },
            cycle_executions: {
                type: []
            },
            next_billing_time: {
                type: Date
            },
            failed_payments_count: {
                type: Number
            }
        },
        create_time: {
            type: Date
        },
        update_time: {
            type: Date
        },
        links: {
            type: []
        }
    });

module.exports = () => {
    try {
        return mongoose.model('subscription');
    } catch (e) {
        return mongoose.model('subscription', paypalSubscriptionSchema);
    }
};