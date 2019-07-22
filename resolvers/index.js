const {getUsers, createUser, updateUser} = require('./user');
const { createApplication, getApplications, getApplicationById, updateApplication } = require('./application');
const { addProduct } = require('./product');

module.exports = {
  Query: {
    hello: () => 'Hello world!',
    getUsers,
  },
  Mutation: {
    createUser,
    updateUser,

    addProduct
  },
};
