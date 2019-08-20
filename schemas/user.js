
const { gql } = require('apollo-server-lambda');

const graphQlUserSchema = `
type User {
    _id: ID!
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
  }

  extend type Query {
    getUsers(_page: Int _limit: Int): [User!]!
    getSelectedUser(id: String): User!
  }

  extend type Mutation {
    createUser(user: UserInput!): User
    updateUser(user: UserInput): User
  }
`

module.exports = gql(graphQlUserSchema);

