const { getUsers, createUser, updateUser, authorize, getUsersAndBugFixesCount } = require('./user');
const { addProduct, updateProduct, deleteProduct, getAllProducts, getProductsByUserId, getProductById } = require('./product');
const { addQuery, getAllHelpRequests, getHelpRequestById, getHelpRequestsByUserId, updateHelpRequest, deleteHelpRequest } = require('./help');
const { addInterview, getAllInterviews, getInterviewById, getInterviewsByUserId, updateInterview, deleteInterview } = require('./interview')
const { addRequirement, getAllRequirements, getRequirementById, getRequirementsByUserId, updateRequirement, deleteRequirement } = require('./requirement')
const { addComment, getComments, getCommentsByReferenceId, } = require('./comment')
const { searchCategories } = require('./categories')

module.exports = {
  Query: {
    hello: () => 'Hello world!',
    getUsers,
    getUsersAndBugFixesCount,

    getAllProducts,
    getProductsByUserId,
    getProductById,

    getComments,
    getCommentsByReferenceId,

    getAllHelpRequests,
    getHelpRequestsByUserId,
    getHelpRequestById,
  
  
    getAllInterviews,
    getInterviewsByUserId,
    getInterviewById,
  
  
    getAllRequirements,
    getRequirementsByUserId,
    getRequirementById,

    searchCategories

  },
  Mutation: {
    createUser,
    updateUser,
    authorize,

    addProduct,
    updateProduct,
    deleteProduct,


    addComment,

    addQuery,
    updateHelpRequest,
    deleteHelpRequest,

    addInterview,
    updateInterview,
    deleteInterview,

    addRequirement,
    updateRequirement,
    deleteRequirement

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
