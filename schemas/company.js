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
        cover: String
        challenges: [Challenge]
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
        cover: String
        challenges: [ChallengeInput]
    }

    type Challenge {
        description: [descriptionBlocks]
        challengeType: String
        createdAt: String
        updatedAt: String
        _id: ID
    }

    input ChallengeInput {
        description: [InputdescriptionBlock]
        challengeType: String
        createdAt: String
        updatedAt: String
        _id: ID
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

    type CompanySubscriptionResponse {
        companyUpdated: Company
    }

    input UpdateOperation {
        field: String
        operation: String
        challenges: ChallengeInput
    }

    extend type Query {
        getCompaniesByType(companyType: String): [Company]
        getCompaniesByUserIdAndType(userId: String, companyType: String): [Company]
        getCompanyById(companyId: String): Company
        getListOfUsersInACompany(companyId: String): [User]
    }

    extend type Mutation {
        addCompany(company: CompanyInput): Company
        updateCompany(company: CompanyInput, updateOperation: UpdateOperation): Company
        deleteCompany(companyId: String): Boolean
    }

    extend type Subscription {
        onCompanyUpdate(companyId: String): CompanySubscriptionResponse
    }
`

module.exports = gql(graphQlCompanySchema);