const { gql } = require('apollo-server-lambda')

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
  description: [descriptionBlocks]
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
  description: [InputdescriptionBlock]
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
  description: [descriptionBlocks]
  price: Int
  _id: ID
  createdBy: User
  createdAt: String
  updatedAt: String
  status: HelpQueryStatus
  categories: [String]
  demo_url: String
  documentation_url: String
  video_url: String
  snippets: [Snippet]
  shortDescription: String
}

input HelpQueryInput {
  question: String
  description: [InputdescriptionBlock]
  price: Int
  _id: ID
  createdBy: String
  createdAt: String
  updatedAt: String
  status: HelpQueryStatus
  categories: [String]
  demo_url: String
  documentation_url: String
  video_url: String
  snippets: [SnippetInput]
  shortDescription: String
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

input InputdescriptionBlock {
  type: String
  data: InputdescriptionBlocks
}

input InputdescriptionBlocks {
  code: String
  language: String

  caption: String
  file: URLInput
  stretched: Boolean
  withBackground: Boolean
  withBorder: Boolean
}






union descriptionBlocks = CodeBlock | ImageBlock

type CodeBlock {
  type: String
  data: Code
}

type Code {
  code: String
  language: String
}

type ImageBlock {
  type: String
  data: Image
}


type Image {
  caption: String
  file: URL
  stretched: Boolean
  withBackground: Boolean
  withBorder: Boolean
}



type URL {
  url: String
}

input URLInput {
  url: String
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
`

module.exports = gql(schema)
