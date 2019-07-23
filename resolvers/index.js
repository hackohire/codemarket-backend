const {getUsers, createUser, updateUser} = require('./user');
const { createApplication, getApplications, getApplicationById, updateApplication } = require('./application');
const { addProduct, updateProduct, getProductsByUserId, getProductById } = require('./product');

module.exports = {
  Query: {
    hello: () => 'Hello world!',
    getUsers,
    getProductsByUserId,
    getProductById
  },
  Mutation: {
    createUser,
    updateUser,

    addProduct,
    updateProduct
  },
};
