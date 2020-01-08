const { gql } = require('apollo-server-lambda')

const schema = `

type Product {
  _id: ID
  type: String
  name: String
  description: [descriptionBlocks]
  shortDescription: String
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
  slug: String

  purchasedBy: [PurchasedBy]
}

type PurchasedBy {
  name: String
  _id: ID
  avatar: String
  createdAt: String
}

input ProductInput {
  _id: ID
  name: String
  type: String
  description: [InputdescriptionBlock]
  featuredImage: String
  createdBy: ID
  price: Int
  categories: [String]
  status: Status
  addedToCart: Boolean
  tags: [TagInput]
  comments: [CommentInput]
  support: SupportInput
  slug: String
}

type Support {
  time: Int
  description: [descriptionBlocks]
}

input SupportInput {
  time: Int
  description: [InputdescriptionBlock]
}

type Comment {
  parents: [Comment]
  children: [Comment]
  _id: ID
  text: [descriptionBlocks]
  referenceId: ID
  type: String
  parentId: ID
  createdBy: User
  createdAt: String

  blockSpecificComment: Boolean
  blockId: ID

  postId: ID
}

input CommentInput {
  parents: [ID]
  children: [ID]
  discussion_id: String
  parentId: ID
  referenceId: ID
  type: String
  _id: ID
  text: [InputdescriptionBlock]
  createdBy: ID
  createdAt: String

  blockSpecificComment: Boolean
  blockId: ID

  postId: ID
}

type Tag {
  name: String
  _id: ID
}

input TagInput {
  name: String
  _id: ID
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


enum Status {
  Created
  Drafted
  Published
  Unpublished
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

input InputdescriptionBlock {
  type: String
  data: InputdescriptionBlocks
  _id: ID
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

  style: String
  items: [String]

  alignment: String

  content: [[String]]

  title: String
  message: String

  service : String
  source : String
  embed : String
  width : Int
  height : Int

  link: String
  meta: MetaInput
}

union descriptionBlocks = CodeBlock | ImageBlock | ParagraphBlock | HeaderBlock | ListBlock | QuoteBlock | TableBlock | WarningBlock | EmbedBlock | LinkToolBlock

type CodeBlock {
  type: String
  data: Code
  _id: ID
}

type Code {
  code: String
  language: String
}

type ImageBlock {
  type: String
  data: Image
  _id: ID
}

type Image {
  caption: String
  file: URL
  stretched: Boolean
  withBackground: Boolean
  withBorder: Boolean
}

type ListBlock {
  type: String
  data: List
  _id: ID
}

type List {
  style: String
  items: [String]
}

type ParagraphBlock {
  type: String
  data: Paragraph
  _id: ID
}

type Paragraph {
  text: String
}


type HeaderBlock {
  type: String
  data: Header
  _id: ID
}

type Header {
  text: String
  level: Int
}

type QuoteBlock {
  type: String
  data: Quote
  _id: ID
}

type Quote {
  text: String
  caption: String
  alignment: String
}

type TableBlock {
  type: String
  data: Table
  _id: ID
}

type Table {
  content: [[String]]
}

type WarningBlock {
  type: String
  data: Warning
  _id: ID
}

type Warning {
  title: String
  message: String
}

type EmbedBlock {
  type: String
  data: Embed
  _id: ID
}

type Embed {
  service : String
  source : String
  embed : String
  width : Int
  height : Int
  caption : String
}

type LinkToolBlock {
  type: String
  data: LinkTool
  _id: ID
}

type LinkTool {
  link: String
  meta: Meta
}

type Meta {
  title: String
  description: String
  domain: String
  url: String
  image:  URL
}

input MetaInput {
  title: String
  description: String
  domain: String
  url: String
  image:  URLInput
}

type URL {
  url: String
}

input URLInput {
  url: String
}

type Address {
  address_line_1: String
  address_line_2: String
  admin_area_2: String
  admin_area_1: String
  postal_code: String
  country_code: String
}

input AddressInput {
  address_line_1: String
  address_line_2: String
  admin_area_2: String
  admin_area_1: String
  postal_code: String
  country_code: String
}

type Name {
  given_name: String
  surname: String
  full_name: String
}

input NameInput {
  given_name: String
  surname: String
  full_name: String
}

input PageOptionsInput {
  pageNumber: Int
  limit: Int
  sort: SortInput
}

input SortInput {
  field: String
  order: String
}

type getAllPostsResponse {
  posts: [Product]
  total: Int
}


type Query {
  hello: String

  getAllPosts(pageOptions: PageOptionsInput, type: String): getAllPostsResponse

  getAllProducts: [Product]
  getListOfUsersWhoPurchased(productId: String): [PurchasedBy]

  getComments(commentId: String): Comment
  getCommentsByReferenceId(referenceId: String): [Comment]
  deleteComment(commentId: String): String

  findFromCollection(keyWord: String, searchCollection: String): [Tag]
}

type Mutation {
  addComment(comment: CommentInput): Comment
  updateComment(commentId: String, text: [InputdescriptionBlock]): Comment
}

type Subscription {
  onCommentAdded(postId: String): Comment
  onCommentUpdated(postId: String): Comment
  onCommentDeleted(postId: String): Comment
}
`

module.exports = gql(schema);

// getProductById(productId: String): Product
// getProductsByUserId(userId: String, status: String): [Product]
// addProduct(product: ProductInput): Product
// updateProduct(product: ProductInput): Product
// deleteProduct(productId: String): Boolean
