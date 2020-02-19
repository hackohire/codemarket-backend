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

        company: Company

        dateRange: [String]

        status: Status
        createdAt: String
        updatedAt: String
        comments: [Comment]
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

        company: CompanyInput

        dateRange: [String]

        status: Status

        createdAt: String
        updatedAt: String
        slug: String
        comments: [CommentInput]
    }    

    extend type Mutation {
        sendEmail(email: EmailInput): Email
    }
`

module.exports = gql(graphQlEmailSchema);