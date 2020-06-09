


const graphQlSubscriptionSchema = `

    type SubscriptionSchema {
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
        status: String
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
        invitationAccepted: Boolean
    }

    input SubscriptionUsersInput {
        name: String
        email: String
        invitationAccepted: Boolean
    }

    extend type Query {
        getMembershipSubscriptionsByUserId(userId: String): [SubscriptionSchema]
    }


    extend type Mutation {
        addMembershipSubscription(subscription: SubscriptionInput): SubscriptionSchema
        inviteMembersToSubscription(subscriptionId: String, users: [SubscriptionUsersInput]): SubscriptionSchema
        cancelSubscription(subscriptionId: String): SubscriptionSchema
        acceptInvitation(subscriptionId: String, email: String): SubscriptionSchema
    }
`

module.exports = graphQlSubscriptionSchema;

