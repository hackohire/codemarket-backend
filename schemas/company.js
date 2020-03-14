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
        cover: String
        comments: [Comment]
        websiteLink: String
        facebookLink: String
        instagramLink: String
        twitterLink: String
        yelpLink: String
        linkedinLink: String
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
        cover: String
        websiteLink: String
        facebookLink: String
        instagramLink: String
        twitterLink: String
        yelpLink: String
        linkedinLink: String
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
        postAdded: Post
        postUpdated: Post
        postDeleted: Post
    }

    type GetCompaniesByTypeResponse {
        companies: [Company]
        total: Int
    }

    extend type Query {
        getCompaniesByType(companyType: String, pageOptions: PageOptionsInput): GetCompaniesByTypeResponse
        getCompaniesByUserIdAndType(userId: String, companyType: String): [Company]
        getCompanyById(companyId: String): Company
        getListOfUsersInACompany(companyId: String): [User]
        getEventsByCompanyId(companyId: String): [Post]
    }

    extend type Mutation {
        addCompany(company: CompanyInput): Company
        updateCompany(company: CompanyInput): Company
        deleteCompany(companyId: String): Boolean
    }
`

module.exports = gql(graphQlCompanySchema);