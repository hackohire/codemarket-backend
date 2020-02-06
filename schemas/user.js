
const { gql } = require('apollo-server-lambda');

const graphQlUserSchema = `
type User {
    _id: ID
    name: String
    email: String
    sub: String
    email_verified: Boolean
    programming_languages: [String]
    github_url: String
    linkedin_url: String
    stackoverflow_url: String
    portfolio_links: [String]
    location: String
    avatar: String
    cover: String
    roles: [String]
    createdAt: String
    currentJobDetails: CurrentJobDetails
    likeCount: Int
    stripeId: ID
    subscription: [SubscriptionSchema]
  }
  
  input UserInput {
    _id: ID
    name: String
    email: String
    sub: String
    email_verified: Boolean
    programming_languages: [String]
    github_url: String
    linkedin_url: String
    stackoverflow_url: String
    portfolio_links: [String]
    location: String
    avatar: String
    cover: String
    roles: [String]
    createdAt: String
    currentJobDetails: CurrentJobDetailsInput
    stripeId: ID
  }

  input CurrentJobDetailsInput {
    jobProfile: [ID]
    company: ID
    companyLocation: String
  }
  
  type CurrentJobDetails {
    jobProfile: [Tag]
    company: Company
    companyLocation: String
  }

  type UserAndBugFixCount {
    _id: ID,
    name: String,
    productCount: Int
  }

  type SubscriptionEvents {
    onCommentAdded: Comment
    post: Post
  }

  type UserPostSubscriptionResponse {
    postAdded: Post
    postUpdated: Post
    postDeleted: Post
}

  extend type Query {
    getUsers(_page: Int _limit: Int): [User!]!
    getUsersAndBugFixesCount: [UserAndBugFixCount]
    getUserById(userId: String): User
  }

  extend type Mutation {
    createUser(user: UserInput!): User
    updateUser(user: UserInput): User
    authorize(applicationId: String): User
  }

  extend type Subscription {
    onUserOnline(user: UserInput): SubscriptionEvents
    onUsersPostChanges(userId: String): UserPostSubscriptionResponse
  }
`

module.exports = gql(graphQlUserSchema);

