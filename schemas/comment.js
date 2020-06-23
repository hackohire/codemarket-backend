const commentSchema = `
  
  type Comment {
    parents: [Comment]
    children: [Comment]
    _id: ID
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

    textHTML: String
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
    createdBy: ID
    createdAt: String
  
    blockSpecificComment: Boolean
    blockId: ID

    textHTML: String
  }

  type FetchLatestCommentsForTheUserEngagedResponse {
    messages: [Comment]
    total: Int
  }

  extend type Query {
    getComments(commentId: String): Comment
    getCommentsByReferenceId(referenceId: String): [Comment]
    deleteComment(commentId: String, postId: String, textHTML: String): String
  
    fetchLatestCommentsForTheUserEngaged(pageOptions: PageOptionsInput, userId: ID): FetchLatestCommentsForTheUserEngagedResponse
  }
  
  extend type Mutation {
    addComment(comment: CommentInput): Comment
    updateComment(commentId: String, postId: String, textHTML: String): Comment
  }
  
  type Subscription {
    onCommentAdded(postId: String, companyId: String, userId: String): Comment
    onCommentUpdated(postId: String, companyId: String, userId: String): Comment
    onCommentDeleted(postId: String, companyId: String, userId: String): Comment
  }
`;

module.exports = commentSchema;