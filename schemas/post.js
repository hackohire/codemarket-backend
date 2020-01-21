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

        dateRange: [String]
        location: Location
        address: String
        eventType: String
        membershipRequired: Boolean
        validSubscription: Boolean
        usersAttending: [User]

        cities: [City]
        company: Company
        companies: [Company]
        salaryCurrency: String
        salaryRangeFrom: Int
        salaryRangeTo: Int
        jobProfile: [String]
        timeline: Int

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

        dateRange: [String]
        location: LocationInput
        address: String
        eventType: String
        membershipRequired: Boolean

        cities: [CityInput]
        company: ID
        companies: [ID]
        salaryCurrency: String
        salaryRangeFrom: Int
        salaryRangeTo: Int
        jobProfile: [String]
        timeline: Int

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

    type RsvpEventResponse {
        validSubscription: Boolean
        usersAttending: [User]
    }
    
    extend type Query {
        getPostsByType(postType: String): [Post]
        getPostsByUserIdAndType(userId: String, status: String, postType: String): [Post]
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