const { gql } = require('apollo-server-lambda');

const quoteSchema = `
    type quote {
        _id: ID
        createdAt: String
        updatedAt: String

        firstName: String
        email: String
        phone: String
        InsuranceType: String
        description: String
    }

    input quoteInput {
        _id: ID
        createdAt: String
        updatedAt: String

        firstName: String
        email: String
        phone: String
        InsuranceType: String
        description: String
    }

    extend type Mutation {
        addquote(quote: quoteInput): quote
        
    }

    extend type Query {
        fetchquote(quote: quoteInput): [quote]
    }
    `
module.exports = gql(quoteSchema);