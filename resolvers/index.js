const { getUsers, createUser, updateUser } = require('./user');
const { createApplication, getApplications, getApplicationById, updateApplication } = require('./application');
const { addProduct, updateProduct, getAllProducts, getProductsByUserId, getProductById } = require('./product');
const { addQuery } = require('./help');
const { addInterview } = require('./interview')
const { addRequirement } = require('./requirement')

module.exports = {
  Query: {
    hello: () => 'Hello world!',
    getUsers,
    getAllProducts,
    getProductsByUserId,
    getProductById
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
