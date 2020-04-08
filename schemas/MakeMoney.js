const { gql } = require('apollo-server-lambda');



const makemoneySchema = `
    type MakeMoney {
        _id: ID
        createdAt: String
        updatedAt: String

        firstName: String
        lastName: String
        email: String
        phone: String
        haveBusiness: String
        describeBusiness: String
        WebsiteLink: String
        businessAddress: String
    }

    input MakeMoneyInput {
        _id: ID
        createdAt: String
        updatedAt: String

        firstName: String
        lastName: String
        email: String
        phone: String
        haveBusiness: String
        describeBusiness: String
        WebsiteLink: String
        businessAddress: String
    }

    extend type Mutation {
        addMakeMoney(makeMoney: MakeMoneyInput): MakeMoney
        
    }

    extend type Query {
        fetchMakeMoney(makeMoney: MakeMoneyInput): [MakeMoney]
    }

`

module.exports = gql(makemoneySchema);