const { gql } = require('apollo-server-lambda');

const graphQlPostSchema = `
    type Post {
        _id: ID
        name: String
        type: String
        description: [descriptionBlocks]
        referencePostUrl: String
        featuredImage: String
        createdBy: User
        price: Int
        categories: [String]
        status: Status
        createdAt: String
        updatedAt: String
        tags: [Tag]
        comments: [Comment]
        support: Support
        likeCount: Int
        slug: String

        connectedWithUser: User
        isPostUnderUser: Boolean

        dateRange: [String]
        location: Location
        address: String
        eventType: String
        membershipRequired: Boolean
        validSubscription: Boolean
        usersAttending: [User]
        cover: String

        cities: [City]
        company: Company
        isPostUnderCompany: Boolean
        companies: [Company]
        salaryCurrency: String
        salaryRangeFrom: Int
        salaryRangeTo: Int
        jobProfile: [Tag]
        timeline: Int

        gapAnalysis: Boolean
        careerCoachSessions: Boolean
        helpingWithMockInterviews: Boolean
        hiringMentoringSessions: Boolean

        businessCoachSessions: Boolean
        businessAreas: [Tag]
        businessGoals: [Tag]
        businessChallenges: [Tag]
        sellProducts: SellProducts
        sellServices: SellServices

        fundingCurrency: String
        fundingAmount: Int
        fundingBy: [Company]
        fundingTo: [Company]
        fundingDate: String
        fundingProcess: [[descriptionBlocks]]

        hiringProcess: [[descriptionBlocks]]

        connectedEvent: ID

        purchasedBy: [PurchasedBy]
    }

    input PostInput {
        _id: ID
        name: String
        type: String
        description: [InputdescriptionBlock]
        referencePostUrl: String
        shortDescription: String
        featuredImage: String
        createdBy: ID
        price: Int
        categories: [String]
        status: Status
        addedToCart: Boolean
        tags: [TagInput]
        createdAt: String
        updatedAt: String
        slug: String
        comments: [CommentInput]
        support: SupportInput

        connectedWithUser: ID
        isPostUnderUser: Boolean

        dateRange: [String]
        location: LocationInput
        address: String
        eventType: String
        membershipRequired: Boolean
        cover: String

        cities: [ID]
        company: ID
        isPostUnderCompany: Boolean
        companies: [ID]
        salaryCurrency: String
        salaryRangeFrom: Int
        salaryRangeTo: Int
        jobProfile: [ID]
        timeline: Int

        gapAnalysis: Boolean
        careerCoachSessions: Boolean
        helpingWithMockInterviews: Boolean
        hiringMentoringSessions: Boolean

        
        businessCoachSessions: Boolean
        businessAreas: [ID]
        businessGoals: [ID]
        businessChallenges: [ID]
        sellProducts: SellProductsInput
        sellServices: SellServicesInput

        fundingCurrency: String
        fundingAmount: Int
        fundingBy: [ID]
        fundingTo: [ID]
        fundingDate: String
        fundingProcess: [[InputdescriptionBlock]]

        hiringProcess: [[InputdescriptionBlock]]

        connectedEvent: ID
        referencePostId: ID
    }

    type Location {
        latitude: Float
        longitude: Float
        address: String
        additionalLocationDetails: String
    }

    input LocationInput {
        latitude: Float
        longitude: Float
        address: String
        additionalLocationDetails: String
    }

    type SellProducts {
        sellProducts: Boolean
        products: [Tag]
    }

    input SellProductsInput {
        sellProducts: Boolean
        products: [ID]
    }

    type SellServices {
        sellServices: Boolean
        services: [Tag]
    }

    input SellServicesInput {
        sellServices: Boolean
        services: [ID]
    }

    type RsvpEventResponse {
        validSubscription: Boolean
        usersAttending: [User]
    }

    type GetPostsByUserIdAndTypeResponse {
        posts: [Post]
        total: Int
    }
    
    
    extend type Query {
        getPostsByType(postType: String): [Post]
        getPostsByUserIdAndType(userId: String, status: String, postType: String, pageOptions: PageOptionsInput): GetPostsByUserIdAndTypeResponse
        getPostById(postId: String): Post
        fullSearch(searchString: String): [Post]

        myRSVP(userId: String): [Post]
    }
    extend type Mutation {
        addPost(post: PostInput): Post
        updatePost(post: PostInput): Post
        deletePost(postId: String): Boolean

        rsvpEvent(userId: String, eventId: String): RsvpEventResponse
        cancelRSVP(userId: String, eventId: String): Post
    }
`

module.exports = gql(graphQlPostSchema);