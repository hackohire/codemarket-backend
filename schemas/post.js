const { gql } = require('apollo-server-lambda');

const graphQlPostSchema = `
    type Post {
        _id: ID
        name: String
        type: String
        description: [descriptionBlocks]
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
    }
    
    input PostInput {
        _id: ID
        name: String
        type: String
        description: [InputdescriptionBlock]
        shortDescription: String
        featuredImage: String
        createdBy: ID
        price: Int
        categories: [String]
        status: Status
        addedToCart: Boolean
        tags: [TagInput]
        comments: [CommentInput]
        support: SupportInput
    }
    
    extend type Query {
        getPostsByType(postType: String): [Post]
        getPostsByUserIdAndType(userId: String, status: String, postType: String): [Post]
        getPostById(postId: String): Post
    }
    extend type Mutation {
        addPost(post: PostInput): Post
        updatePost(post: PostInput): Post
        deletePost(postId: String): Boolean        
    }
`

module.exports = gql(graphQlPostSchema);