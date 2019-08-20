const { gql } = require('apollo-server-lambda')

const schema = `

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
  tags: [Tag]
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
  tags: [TagInput]
}

type Tag {
  name: String
  _id: ID
}

input TagInput {
  name: String
  _id: ID
}

type Requirement {
  _id: ID
  name: String
  description: [descriptionBlocks]
  shortDescription: String
  featuredImage: String
  createdBy: User
  price: Int
  categories: [String]
  demo_url: String
  status: ProductStatus
  createdAt: String
  updatedAt: String
  tags: [Tag]
}

input RequirementInput {
  _id: ID
  name: String
  description: [InputdescriptionBlock]
  shortDescription: String
  featuredImage: String
  createdBy: ID
  price: Int
  categories: [String]
  demo_url: String
  status: ProductStatus
  tags: [TagInput]
}

type Interview {
  _id: ID
  name: String
  description: [descriptionBlocks]
  shortDescription: String
  featuredImage: String
  createdBy: User
  price: Int
  categories: [String]
  demo_url: String
  status: ProductStatus
  createdAt: String
  updatedAt: String
  tags: [Tag]
}

input InterviewInput {
  _id: ID
  name: String
  description: [InputdescriptionBlock]
  shortDescription: String
  featuredImage: String
  createdBy: ID
  price: Int
  categories: [String]
  demo_url: String
  status: ProductStatus
  tags: [TagInput]
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
  tags: [Tag]
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
  tags: [TagInput]
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
  text: String
  level: Int
  code: String
  language: String

  caption: String
  file: URLInput
  stretched: Boolean
  withBackground: Boolean
  withBorder: Boolean
}






union descriptionBlocks = CodeBlock | ImageBlock | ParagraphBlock | HeaderBlock

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

type ParagraphBlock {
  type: String
  data: Paragraph
}

type Paragraph {
  text: String
}


type HeaderBlock {
  type: String
  data: Header
}

type Header {
  text: String
  level: Int
}





type URL {
  url: String
}

input URLInput {
  url: String
}



type Query {
  hello: String

  getAllProducts: [Product]
  getProductsByUserId(userId: String): [Product]
  getProductById(productId: String): Product

  getAllHelpRequests: [HelpQuery]
  getHelpRequestsByUserId(userId: String): [HelpQuery]
  getHelpRequestById(helpRequestId: String): HelpQuery


  getAllInterviews: [Interview]
  getInterviewsByUserId(userId: String): [Interview]
  getInterviewById(interviewId: String): Interview


  getAllRequirements: [Requirement]
  getRequirementsByUserId(userId: String): [Requirement]
  getRequirementById(requirementId: String): Requirement
}

type Mutation {

  addProduct(product: ProductInput): Product
  updateProduct(product: ProductInput): Product
  deleteProduct(productId: String): Boolean

  addQuery(helpQuery: HelpQueryInput): HelpQuery

  addInterview(interview: InterviewInput): Interview

  addRequirement(requirement: RequirementInput): Requirement
}
`

module.exports = gql(schema)
