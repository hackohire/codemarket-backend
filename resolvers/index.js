const { getUsers, createUser, updateUser, authorize, getUsersAndBugFixesCount, getUserById } = require('./user');
const { addProduct, updateProduct, deleteProduct, getAllProducts, getProductsByUserId, getProductById } = require('./product');
const { addQuery, getAllHelpRequests, getHelpRequestById, getHelpRequestsByUserId, updateHelpRequest, deleteHelpRequest } = require('./help');
const { addInterview, getAllInterviews, getInterviewById, getInterviewsByUserId, updateInterview, deleteInterview } = require('./interview')
const { addRequirement, getAllRequirements, getRequirementById, getRequirementsByUserId, updateRequirement, deleteRequirement } = require('./requirement')
const { addComment, updateComment, getComments, getCommentsByReferenceId, deleteComment } = require('./comment')
const { searchCategories } = require('./categories')
const { addTransaction, getPurchasedUnitsByUserId } = require('./purchase')
const { addToCart, removeItemFromCart, getCartItemsList } = require('./cart')

module.exports = {
  Query: {
    hello: () => 'Hello world!',
    getUsers,
    getUsersAndBugFixesCount,
    getUserById,

    getAllProducts,
    getProductsByUserId,
    getProductById,

    getComments,
    getCommentsByReferenceId,
    deleteComment,

    getAllHelpRequests,
    getHelpRequestsByUserId,
    getHelpRequestById,
  
  
    getAllInterviews,
    getInterviewsByUserId,
    getInterviewById,
  
  
    getAllRequirements,
    getRequirementsByUserId,
    getRequirementById,

    searchCategories,

    getPurchasedUnitsByUserId,

    getCartItemsList

  },
  Mutation: {
    createUser,
    updateUser,
    authorize,

    addProduct,
    updateProduct,
    deleteProduct,


    addComment,
    updateComment,

    addQuery,
    updateHelpRequest,
    deleteHelpRequest,

    addInterview,
    updateInterview,
    deleteInterview,

    addRequirement,
    updateRequirement,
    deleteRequirement,

    addTransaction,

    addToCart,
    removeItemFromCart

  },

  descriptionBlocks: {
    __resolveType(block, context, info) {

      switch(block.type) {

        case 'paragraph':
          return 'ParagraphBlock'

        case 'header':
          return 'HeaderBlock'

        case 'code':
          return 'CodeBlock';

        case 'image': 
          return 'ImageBlock';

        case 'list':
          return 'ListBlock'

        case 'quote':
          return 'QuoteBlock'

        case 'table':
          return 'TableBlock'

        case 'warning':
          return 'WarningBlock'

        default:
          console.log('default case')
          return null;
      }
    },
  },

};
