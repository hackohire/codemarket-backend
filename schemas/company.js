const { gql } = require('apollo-server-lambda');

const graphQlCompanySchema = `
    type Company {
        _id: ID
        name: String
        type: String
        description: [descriptionBlocks]
        createdBy: User
        status: Status
        createdAt: String
        updatedAt: String
        cities: [City]
        ideas: [descriptionBlocks]
        questions: [descriptionBlocks]
        location: Location
    }

    input CompanyInput {
        _id: ID
        name: String
        type: String
        description: [InputdescriptionBlock]
        ideas: [InputdescriptionBlock]
        questions: [InputdescriptionBlock]
        createdBy: ID
        status: Status
        cities: [CityInput]
        location: LocationInput
    }

    type City {
        name: String
        country: String
        _id: ID
      }

    input CityInput {
        name: String
        country: String
        _id: ID
    }

    extend type Query {
        getCompaniesByType(companyType: String): [Company]
        getCompaniesByUserIdAndType(userId: String, companyType: String): [Company]
        getCompanyById(companyId: String): Company
        getListOfUsersInACompany(companyId: String): [User]
    }

    extend type Mutation {
        addCompany(company: CompanyInput): Company
        updateCompany(company: CompanyInput): Company
        deleteCompany(companyId: String): Boolean
    }
`

module.exports = gql(graphQlCompanySchema);