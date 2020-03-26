const { gql } = require('apollo-server-lambda');

const quoteSchema = `
 type QuoteFields = {
     _id: ID
     createdAt: String
     updatedAt: String

     name: String
     email: String
     zipCode: String
     age: String
     sex: String
     coverageAmount: String
     termLength: String
     healthLevel: String
 }

 input InputQuoteFields = {
    _id: ID
    createdAt: String
    updatedAt: String

    name: String
    email: String
    zipCode: String
    age: String
    sex: String
    coverageAmount: String
    termLength: String
    healthLevel: String
 }

 extend type Mutation {
     getQuote(quote:QuoteFieldInput) : QuoteFields
 }
`
module.exports = gql(quoteSchema);