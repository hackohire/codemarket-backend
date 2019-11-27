
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
    roles: [String]
    createdAt: String
    currentJobDetails: CurrentJobDetails
    likeCount: Int
    stripeId: ID
    subscription: [Subscription]
    businessAreaInterests: [Tag]
    leadershipAreaInterests: [Tag]
    socialImpactInterests: [Tag]
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
    roles: [String]
    createdAt: String
    currentJobDetails: CurrentJobDetailsInput
    stripeId: ID
    businessAreaInterests: [TagInput]
    leadershipAreaInterests: [TagInput]
    socialImpactInterests: [TagInput]
  }

  input CurrentJobDetailsInput {
    jobProfile: String
    companyName: String
    companyLocation: String
  }
  
  type CurrentJobDetails {
    jobProfile: String
    companyName: String
    companyLocation: String
  }

  type UserAndBugFixCount {
    _id: ID,
    name: String,
    productCount: Int
  }

  type getMyProfileInfo {
    dreamJob: [Post]
    businessAreaInterests: [Tag]
    leadershipAreaInterests: [Tag]
    socialImpactInterests: [Tag]
  }

  extend type Query {
    getUsers(_page: Int _limit: Int): [User!]!
    getUsersAndBugFixesCount: [UserAndBugFixCount]
    getUserById(userId: String): User
    getMyProfileInfo(userId: String): getMyProfileInfo
  }

  extend type Mutation {
    createUser(user: UserInput!): User
    updateUser(user: UserInput): User
    authorize(applicationId: String): User
  }
`

module.exports = gql(graphQlUserSchema);

