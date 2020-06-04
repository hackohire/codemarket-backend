

const schema = `
scalar JSON
scalar JSONObject
scalar Upload

type Tag {
  name: String
  type: String
  campaignId: String
  _id: ID
}

input TagInput {
  name: String
  type: String
  _id: ID
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
  posts: [Post]
  total: Int
}

input ReferenceObject {
  referencePostId: [ID]
  connectedPosts: [ID]
  postType: String
}


type Query {
  hello: String

  getAllPosts(pageOptions: PageOptionsInput, type: String, reference: ReferenceObject, companyId: String, connectedWithUser: String, createdBy: String, searchString: String): getAllPostsResponse

  findFromCollection(keyWord: String, searchCollection: String, type: String): [Tag]
}

type Mutation {
  addToCollection(keyWord: String, searchCollection: String, type: String): Tag
}
`

module.exports = schema;

// getProductById(productId: String): Product
// getProductsByUserId(userId: String, status: String): [Product]
// addProduct(product: ProductInput): Product
// updateProduct(product: ProductInput): Product
// deleteProduct(productId: String): Boolean
