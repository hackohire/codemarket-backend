
const { gql } = require('apollo-server-lambda');

const graphQlSubscriptionSchema = `

    type Subscription {
        _id: ID
        id: ID
        customer: String
        amount: Float
        start_date: Int
        current_period_start: Int
        current_period_end: Int
        plan: Plan
        metadata: Metadata
        quantity: Int
        subscriptionUsers: [SubscriptionUsers]
    }

    type Plan {
        id: String
        active: Boolean
        amount: Float
        nickname: String
    }

    input PlanInput {
        id: String
        active: Boolean
        amount: Float
        nickname: String
    }

    type Metadata {
        userId: User
        email: String
    }

    input MetadataInput {
        userId: ID
        email: String
    }

    input SubscriptionInput {
        _id: ID
        id: ID
        customer: String
        amount: Float
        start_date: Int
        current_period_start: Int
        current_period_end: Int
        plan: PlanInput
        metadata: MetadataInput
        quantity: Int
        subscriptionUsers: [SubscriptionUsersInput]
    }

    type SubscriptionUsers {
        name: String
        email: String
    }

    input SubscriptionUsersInput {
        name: String
        email: String
    }

    extend type Query {
        getMembershipSubscriptionsByUserId(userId: String): [Subscription]
    }


    extend type Mutation {
        addMembershipSubscription(subscription: SubscriptionInput): Subscription
    }
`

module.exports = gql(graphQlSubscriptionSchema);

