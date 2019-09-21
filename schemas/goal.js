const { gql } = require('apollo-server-lambda');

const graphQlGoalSchema = `
    type Goal {
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
    
    input GoalInput {
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
        getAllGoals: [Goal]
        getGoalsByUserId(userId: String, status: String): [Goal]
        getGoalById(goalId: String): Goal
    }
    extend type Mutation {
        addGoal(goal: GoalInput): Goal
        updateGoal(goal: GoalInput): Goal
        deleteGoal(goalId: String): Boolean        
    }
`

module.exports = gql(graphQlGoalSchema);