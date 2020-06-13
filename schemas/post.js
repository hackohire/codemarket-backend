

const graphQlPostSchema = `
    type Post {
        _id: ID
        name: String
        type: String
        referencePostUrl: String
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
        slug: String
        cover: String

        cities: [City]
        companies: [Company]

        connectedPosts: [Post]
        collaborators: [User]
        clients: [User]

        phone: [String]
        email: [String]
        birthDate: String
        address: String
        website: String

        descriptionHTML: String
        activities: [Activities]

        appointment_date: String
        cancelReason: String
        duration: [String]

        mentor: JSON
        job: JSON
        formStrucutreJSON: JSON
    }

    input PostInput {
        _id: ID
        name: String
        type: String
        referencePostUrl: String
        createdBy: ID
        users: [UserInput]
        price: Int
        status: Status
        tags: [TagInput]
        createdAt: String
        updatedAt: String
        slug: String
        comments: [CommentInput]
        cover: String

        cities: [ID]

        companies: [JSON]

        connectedPosts: [ID]
        connectedEmail: ID
        
        collaborators: [UserInput]
        clients: [UserInput]

        phone: [String]
        email: [String]
        birthDate: String
        address: String
        website: String

        descriptionHTML: String
        activities: [ActivitiesInput]

        appointment_date: String
        cancelReason: String
        duration: [String]

        mentor: JSON
        job: JSON
        formStrucutreJSON: JSON
    }

    type Activities {
        action: String
        activityDate: String
        by: User
        commentId: ID
        postId: ID
        message: String
    }

    input ActivitiesInput {
        action: String
        activityDate: String
        by: UserInput
        commentID: ID
        postId: ID
        message: String
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

    type getDuration {
        appointment: [Post]
    }

    extend type Query {
        getPostsByType(postType: String): [Post]
        getPostsByUserIdAndType(userId: String, status: String, postType: String, pageOptions: PageOptionsInput): GetPostsByUserIdAndTypeResponse
        getPostById(postId: String): Post
        fullSearch(searchString: String): [Post]
        getCountOfAllPost(userId: String, companyId: String, reference: ReferenceObject): [getCountAllPost]
        getEmailPhoneCountForContact(type: String): [emailPhoneCount]
        getPostByPostType(postType: String, userId: String, pageOptions: PageOptionsInput): GetPostsByUserIdAndTypeResponse
        getAlreadyBookedSlots(date: String): getDuration
    }
    extend type Mutation {
        addPost(post: PostInput): Post
        updatePost(post: PostInput, updatedBy: UserInput): Post
        updatePostContent(post: PostInput, updatedBy: UserInput): String
        deletePost(postId: String, deletedBy: UserInput): Boolean
    }
`

module.exports = graphQlPostSchema;