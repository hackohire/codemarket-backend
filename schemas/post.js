const { gql } = require('apollo-server-lambda');

const graphQlPostSchema = `
    type Post {
        _id: ID
        name: String
        type: String
        description: [descriptionBlocks]
        referencePostUrl: String
        createdBy: User
        status: Status
        createdAt: String
        updatedAt: String
        tags: [Tag]
        comments: [Comment]
        likeCount: Int
        slug: String

        dateRange: [String]
        address: String
        eventType: String

        validSubscription: Boolean
        usersAttending: [User]

        cities: [City]
        company: Company
        companies: [Company]
        salaryCurrency: String
        salaryRangeFrom: Int
        salaryRangeTo: Int
        jobProfile: [Tag]
        timeline: Int

        purchasedBy: [PurchasedBy]

        collaborators: [User]
        assignees: [User]
    }

    input PostInput {
        _id: ID
        name: String
        type: String
        description: [InputdescriptionBlock]
        referencePostUrl: String

        createdBy: ID
        price: Int
        status: Status


        tags: [TagInput]
        createdAt: String
        updatedAt: String
        slug: String
        comments: [CommentInput]
        support: SupportInput

        dateRange: [String]
        address: String
        eventType: String

        cities: [ID]

        company: CompanyInput
        companies: [ID]
        salaryCurrency: String
        salaryRangeFrom: Int
        salaryRangeTo: Int
        jobProfile: [ID]
        timeline: Int

        connectedEmail: ID
        
        collaborators: [UserInput]
        assignees: [UserInput]
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