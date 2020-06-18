// const { gql } = require('graphql');

const graphQlEmailSchema = `
    type Email {
        _id: ID
        name: String
        type: String
        to: [String]
        cc: [String]
        bcc: [String]
        subject: String
        descriptionHTML: String
        city: String
        createdBy: User
        from: String
        companies: [Company]

        dateRange: [String]

        status: Status

        campaignId: ID

        createdAt: String
        updatedAt: String
        comments: [Comment]

        slug: String

        tracking: [TrackingData]
        isReplied: Boolean
        repliedHTML: String
    }

    input EmailInput {
        _id: ID
        to: [String]
        cc: [String]
        bcc: [String]
        subject: String
        type: String
        descriptionHTML: String
        from: String
        createdBy: ID

        companies: [CompanyInput]

        dateRange: [String]

        status: Status

        campaignId: ID

        createdAt: String
        updatedAt: String
        comments: [CommentInput]
        city: String
        slug: String
        isReplied: Boolean
        repliedHTML: String
    }    

    extend type Mutation {
        sendEmail(email: EmailInput): Email,
        sendEmailFromFrontend(email: EmailInput): JSON
    }
`

module.exports = graphQlEmailSchema;