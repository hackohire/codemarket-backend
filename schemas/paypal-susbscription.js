
const { gql } = require('apollo-server-lambda');

const graphQlPaypalSubscriptionSchema = `
    type PaypalSubscription {
        _id: ID
        status: String
        id: String
        plan_id: String
        start_time: String
        create_time: String
        update_time: String
        subscriber: Subscriber
        
        purchasedBy: User
    }
    
    input PaypalSubscriptionInput {
        _id: ID
        status: String
        status_update_time: String
        status_changed_by: String
        id: String
        plan_id: String
        start_time: String
        quantity: String
        create_time: String
        update_time: String
        links: [Links ]
        billing_info: BillingInfo
        subscriber: SubscriberInput
        shipping_amount: ShippingAmount

        purchasedBy: ID
    }


    input Links { href: String rel: String method: String }

    input CycleExecutions { 
        tenure_type: String
        sequence: Int
        cycles_completed: Int
        cycles_remaining: Int
        current_pricing_scheme_version: Int
        total_cycles: Int 
    }

    input OutstandingBalance { currency_code: String value: String }

    input BillingInfo { 
        next_billing_time: String
        failed_payments_count: Int
        cycle_executions: [CycleExecutions ]
        outstanding_balance: OutstandingBalance
    }

    type ShippingAddress { address: Address }

    input ShippingAddressInput { address: AddressInput }

    input SubscriberInput {
        email_address: String
        shipping_address: ShippingAddressInput
        name: NameInput
    }

    type Subscriber {
        email_address: String
        shipping_address: ShippingAddress
        name: Name
    }

    input ShippingAmount { currency_code: String value: String }



    extend type Query {
        getMembershipSubscriptionsByUserId(userId: String): [PaypalSubscription]
    }


    extend type Mutation {
        addMembershipSubscription(subscription: PaypalSubscriptionInput): PaypalSubscription
    }
`

module.exports = gql(graphQlPaypalSubscriptionSchema);

