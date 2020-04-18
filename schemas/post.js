

const graphQlPostSchema = `
    type Post {
        _id: ID
        name: String
        type: String
        description: [descriptionBlocks]
        referencePostUrl: String
        featuredImage: String
        createdBy: User
        users: [User]
        price: Int
        categories: [String]
        status: Status
        createdAt: String
        updatedAt: String
        tags: [Tag]
        comments: [Comment]
        commentCount: Int
        likeCount: Int
        slug: String

        dateRange: [String]
        location: Location
        eventType: String
        membershipRequired: Boolean
        validSubscription: Boolean
        usersAttending: [User]
        cover: String

        cities: [City]
        companies: [Company]
        salaryCurrency: String
        salaryRangeFrom: Int
        salaryRangeTo: Int
        jobProfile: [Tag]
        timeline: Int

        purchasedBy: [PurchasedBy]

        connectedPosts: [Post]
        collaborators: [User]
        assignees: [User]
        clients: [User]
        phone: [String]
        email: [String]
        birthDate: String
        address: String
        website: String
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
        users: [UserInput]
        price: Int
        status: Status
        tags: [TagInput]
        createdAt: String
        updatedAt: String
        slug: String
        comments: [CommentInput]

        dateRange: [String]
        location: LocationInput
        eventType: String
        membershipRequired: Boolean
        cover: String

        cities: [ID]

        companies: [CompanyInput]
        salaryCurrency: String
        salaryRangeFrom: Int
        salaryRangeTo: Int
        jobProfile: [ID]
        timeline: Int

        connectedPosts: [ID]
        connectedEmail: ID
        
        collaborators: [UserInput]
        assignees: [UserInput]
        clients: [UserInput]

        phone: [String]
        email: [String]
        birthDate: String
        address: String
        website: String
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
    
    type getCountAllPost {
        _id: String,
        count: Int
    }

    type emailPhoneCount {
        _id: String,
        emailCount: String,
        phoneCount: String
    }

    extend type Query {
        getPostsByType(postType: String): [Post]
        getPostsByUserIdAndType(userId: String, status: String, postType: String, pageOptions: PageOptionsInput): GetPostsByUserIdAndTypeResponse
        getPostById(postId: String): Post
        fullSearch(searchString: String): [Post]
        fetchFiles(blockType: String, userId: String): [AttachesBlock]
        getCountOfAllPost(userId: String, companyId: String, reference: ReferenceObject): [getCountAllPost]
        getEmailPhoneCountForContact(type: String): [emailPhoneCount]
        myRSVP(userId: String): [Post]
    }
    extend type Mutation {
        addPost(post: PostInput): Post
        updatePost(post: PostInput, updatedBy: UserInput): Post
        deletePost(postId: String, deletedBy: UserInput): Boolean

        rsvpEvent(userId: String, eventId: String): RsvpEventResponse
        cancelRSVP(userId: String, eventId: String): Post
    }
`

module.exports = graphQlPostSchema;