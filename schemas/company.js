const { gql } = require('apollo-server-lambda');

const graphQlCompanySchema = `
    type Company {
        _id: ID
        name: String
        title: String
        type: String
        howCanYouHelp: [descriptionBlocks]
        createdBy: User
        status: Status
        createdAt: String
        updatedAt: String
        cities: [City]
    }

    input CompanyInput {
        _id: ID
        name: String
        title: String
        type: String
        howCanYouHelp: [InputdescriptionBlock]
        createdBy: ID
        status: Status
        cities: [CityInput]
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
        getAllCompanies: [Company]
        getCompaniesByType(companyType: String): [Company]
        getCompaniesByUserIdAndType(userId: String, companyType: String): [Company]
        getCompanyById(companyId: String): Company
    }

    extend type Mutation {
        addCompany(company: CompanyInput): Company
        updateCompany(company: CompanyInput): Company
        deleteCompany(companyId: String): Boolean
    }
`

module.exports = gql(graphQlCompanySchema);