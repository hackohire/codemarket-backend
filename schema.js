const { gql } = require('apollo-server-lambda');

const schema = `
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

type Product {
  _id: ID
  name: String
  description: String
  shortDescription: String
  featuredImage: String
  createdBy: ID
  priceAndFiles: PriceAndFiles
  totalPrice: Float
  categories: [String]
  demo_url: String
  documentation_url: String
  video_url: String
  status: ProductStatus
}

input ProductInput {
  _id: ID
  name: String
  description: String
  shortDescription: String
  featuredImage: String
  createdBy: ID
  priceAndFiles: PriceAndFilesInput
  totalPrice: Float
  categories: [String]
  demo_url: String
  documentation_url: String
  video_url: String
  status: ProductStatus
}

type PriceAndFiles {
  fileName: String
  file: String
  price: Float
}

input PriceAndFilesInput {
  fileName: String
  file: String
  price: Float
}

enum ProductStatus {
  Created
  Drafted
  Submitted
  Approved
  Rejected
  Archieved
  Deleted
}

enum Roles {
  User
  Admin
}



type Query {
  hello: String
  getUsers(_page: Int _limit: Int): [User!]!
  getSelectedUser(id: String): User!
}

type Mutation {
  createUser(user: UserInput!): User
  updateUser(user: UserInput): User

  addProduct(product: ProductInput): Product
}
`;

module.exports = gql(schema);
