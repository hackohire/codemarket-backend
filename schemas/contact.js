const { gql } = require('apollo-server-lambda');

const graphQlContactSchema = `
    type Contact {
        _id: ID
        name: String
        email: String
        subject: String
        description: String
    }

    input ContactInput {
        _id: ID
        name: String
        email: String
        subject: String
        description: String
    }    

    extend type Mutation {
        getContact(contact: ContactInput): Contact
        addContact(contact: ContactInput): Contact  
        fetchContacts(contact: ContactInput): Contact
    }
`

module.exports = gql(graphQlContactSchema);