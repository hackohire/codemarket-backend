const { gql } = require('apollo-server-lambda');

const graphQlBookingSchema = `
    type Booking {
        _id: ID
        expert: User
        createdBy: User
        referenceId: Product
        status: BookingStatus
        createdAt: String
        schedule: [String]
        updatedAt: String
    }

    input BookingInput {
        _id: ID
        expert: ID
        createdBy: ID
        referenceId: ID
        status: BookingStatus
        createdAt: String
        updatedAt: String
        schedule: [String]
    }

    enum BookingStatus {
        InvitationSent
    }

    extend type Query {
        getBookingList(userId: String): [Booking]
    }

    extend type Mutation {
        scheduleCall(booking: BookingInput): Booking
    }
`

module.exports = gql(graphQlBookingSchema);