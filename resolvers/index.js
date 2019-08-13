const { getUsers, createUser, updateUser } = require('./user');
const { createApplication, getApplications, getApplicationById, updateApplication } = require('./application');
const { addProduct, updateProduct, getAllProducts, getProductsByUserId, getProductById } = require('./product');
const { addQuery } = require('./help');

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

    addQuery
  },

  descriptionBlocks: {
    __resolveType(block, context, info) {

      switch(block.type) {
        case 'code':
          return 'CodeBlock';

        case 'image': 
          return 'ImageBlock';

        
        case 'header':
          return null;

        default:
          console.log('default case')
          return null;
      }
    },
  },

};
