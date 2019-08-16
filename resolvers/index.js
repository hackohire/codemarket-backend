const { getUsers, createUser, updateUser } = require('./user');
const { addProduct, updateProduct, getAllProducts, getProductsByUserId, getProductById } = require('./product');
const { addQuery, getAllHelpRequests, getHelpRequestById, getHelpRequestsByUserId } = require('./help');
const { addInterview, getAllInterviews, getInterviewById, getInterviewsByUserId } = require('./interview')
const { addRequirement, getAllRequirements, getRequirementById, getRequirementsByUserId } = require('./requirement')

module.exports = {
  Query: {
    hello: () => 'Hello world!',
    getUsers,

    getAllProducts,
    getProductsByUserId,
    getProductById,

    getAllHelpRequests,
    getHelpRequestsByUserId,
    getHelpRequestById,
  
  
    getAllInterviews,
    getInterviewsByUserId,
    getInterviewById,
  
  
    getAllRequirements,
    getRequirementsByUserId,
    getRequirementById
  },
  Mutation: {
    createUser,
    updateUser,

    addProduct,
    updateProduct,

    addQuery,

    addInterview,

    addRequirement

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

        default:
          console.log('default case')
          return null;
      }
    },
  },

};
