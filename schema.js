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
  createdBy: User
  priceAndFiles: [PriceAndFiles]
  totalPrice: Int
  categories: [String]
  demo_url: String
  documentation_url: String
  video_url: String
  status: ProductStatus
  createdAt: String
  updatedAt: String
  snippets: [Snippet]
  addedToCart: Boolean
}

input ProductInput {
  _id: ID
  name: String
  description: String
  shortDescription: String
  featuredImage: String
  createdBy: ID
  priceAndFiles: [PriceAndFilesInput]
  totalPrice: Int
  categories: [String]
  demo_url: String
  documentation_url: String
  video_url: String
  status: ProductStatus
  snippets: [SnippetInput]
  addedToCart: Boolean
}

type Snippet {
  language: String
  r: Int
  value: String
}

input SnippetInput {
  language: String
  r: Int
  value: String
}

type PriceAndFiles {
  fileName: String
  file: String
  price: Int
}

input PriceAndFilesInput {
  fileName: String
  file: String
  price: Int
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

type HelpQuery {
  question: String
  description: String
  price: Int
  _id: ID
  createdBy: User
  createdAt: String
  updatedAt: String
  status: HelpQueryStatus
}

input HelpQueryInput {
  question: String
  description: String
  price: Int
  _id: ID
  createdBy: String
  createdAt: String
  updatedAt: String
  status: HelpQueryStatus
}

enum HelpQueryStatus {
  Created
  Submitted
  Approved
  Rejected
  Archieved
  Deleted
  Published
  Unpublished
  Resolved
}



type Query {
  hello: String
  getUsers(_page: Int _limit: Int): [User!]!
  getSelectedUser(id: String): User!

  getAllProducts: [Product]
  getProductsByUserId(userId: String): [Product]
  getProductById(productId: String): Product
}

type Mutation {
  createUser(user: UserInput!): User
  updateUser(user: UserInput): User

  addProduct(product: ProductInput): Product
  updateProduct(product: ProductInput): Product

  addQuery(helpQuery: HelpQueryInput): HelpQuery
}
`;

module.exports = gql(schema);
