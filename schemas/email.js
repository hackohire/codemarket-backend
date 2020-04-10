const { gql } = require('apollo-server-lambda');

const graphQlEmailSchema = `
    type Email {
        _id: ID
        name: String
        type: String
        to: [String]
        cc: [String]
        bcc: [String]
        subject: String
        description: [descriptionBlocks]
        descriptionHTML: String

        createdBy: User

        companies: [Company]

        dateRange: [String]

        status: Status

        campaignId: ID

        createdAt: String
        updatedAt: String
        comments: [Comment]

        slug: String

        tracking: TrackingData
    }

    input EmailInput {
        _id: ID
        to: [String]
        cc: [String]
        bcc: [String]
        subject: String
        type: String
        description: [InputdescriptionBlock]
        descriptionHTML: String

        createdBy: ID

        companies: [CompanyInput]

        dateRange: [String]

        status: Status

        campaignId: ID

        createdAt: String
        updatedAt: String
        comments: [CommentInput]

        slug: String
    }    

    extend type Mutation {
        sendEmail(email: EmailInput): Email
    }
`

module.exports = gql(graphQlEmailSchema);