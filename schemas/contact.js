const { gql } = require('apollo-server-lambda');



const contactSchema = `
    type contact {
        _id: ID
        createdAt: String
        updatedAt: String

        firstName: String
        lastName: String
        email: String
        phone: String
        address: String
        showDate: String
    }

    input contactInput {
        _id: ID
        createdAt: String
        updatedAt: String

        firstName: String
        lastName: String
        email: String
        phone: String
        address: String
        showDate: String
    }

    extend type Mutation {
        addcontact(contact: contactInput): contact
        
    }

`

module.exports = gql(contactSchema);