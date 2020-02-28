const { gql } = require('apollo-server-lambda')

const commentSchema = `
  
  type Comment {
    parents: [Comment]
    children: [Comment]
    _id: ID
    text: [descriptionBlocks]
    type: String
    parentId: ID
    createdBy: User
    createdAt: String
  
    blockSpecificComment: Boolean
    blockId: ID
    
    userReferenceId: ID
    referenceId: ID
    companyReferenceId: ID

    referenceCompany: Company
    referencePost: Post
  }
  
  input CommentInput {
    parents: [ID]
    children: [ID]
    discussion_id: String
    parentId: ID
    referenceId: ID
    companyReferenceId: ID
    userReferenceId: ID
    type: String
    _id: ID
    text: [InputdescriptionBlock]
    createdBy: ID
    createdAt: String
  
    blockSpecificComment: Boolean
    blockId: ID
  }

  type FetchLatestCommentsForTheUserEngagedResponse {
    messages: [Comment]
    total: Int
  }

  extend type Query {
    getComments(commentId: String): Comment
    getCommentsByReferenceId(referenceId: String): [Comment]
    deleteComment(commentId: String): String
  
    fetchLatestCommentsForTheUserEngaged(pageOptions: PageOptionsInput, userId: ID): FetchLatestCommentsForTheUserEngagedResponse
  }
  
  extend type Mutation {
    addComment(comment: CommentInput): Comment
    updateComment(commentId: String, text: [InputdescriptionBlock]): Comment
  }
  
  type Subscription {
    onCommentAdded(postId: String, companyId: String, userId: String): Comment
    onCommentUpdated(postId: String, companyId: String, userId: String): Comment
    onCommentDeleted(postId: String, companyId: String, userId: String): Comment
  }
`;

module.exports = gql(commentSchema);