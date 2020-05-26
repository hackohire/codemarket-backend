

const graphQlCompanySchema = `
    type Company {
        _id: ID
        name: String
        type: String
        description: [descriptionBlocks]
        owners: [User]
        createdBy: User
        status: Status
        createdAt: String
        updatedAt: String
        slug: String
        cities: [City]
        ideas: [descriptionBlocks]
        questions: [descriptionBlocks]
        location: Location
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
        owners: [UserInput]
        status: Status
        cities: [CityInput]
        location: LocationInput
        cover: String
        websiteLink: String
        facebookLink: String
        slug: String
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
        getCompanyById(slug: String): Company
        getListOfUsersInACompany(companyId: String): [User]
        getEventsByCompanyId(companyId: String): [Post]
    }

    extend type Mutation {
        addCompany(company: CompanyInput): Company
        updateCompany(company: CompanyInput): Company
        deleteCompany(companyId: String): Boolean
    }

    extend type Subscription {
        onCompanyPostChanges(companyId: String): CompanySubscriptionResponse
    }
`

module.exports = graphQlCompanySchema;