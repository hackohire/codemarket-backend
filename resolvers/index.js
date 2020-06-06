const { getUsers, createUser, updateUser, authorize, getUserById, createBraintreeTransaction } = require('./user');
const { addComment, updateComment, getComments, getCommentsByReferenceId, deleteComment, fetchLatestCommentsForTheUserEngaged } = require('./comment');
const { findFromCollection, addToCollection } = require('./categories');
const { getAllPosts, addPost, getPostsByUserIdAndType, getPostById, getPostsByType, updatePost, updatePostContent, deletePost, fullSearch, getCountOfAllPost, getEmailPhoneCountForContact, saveContact, getPostByPostType } = require('./post');
const { addCompany, updateCompany, getCompaniesByUserIdAndType, getCompanyById, getCompaniesByType, deleteCompany, getListOfUsersInACompany, getEventsByCompanyId } = require('./company');
const { sendEmail } = require('./email');
const { addMakeMoney } = require('./makeMoney');
const { addMembershipSubscription, getMembershipSubscriptionsByUserId, inviteMembersToSubscription, acceptInvitation, cancelSubscription } = require('./subscription');
const { fetchFields, fetchPostTypes, addPostType, updatePostType, deletePostType } = require('./post-type');
const { getCampaignsWithTracking, getCampaignEmails, getCsvFileData, getEmailData, saveCsvFileData, getMailingList } = require('./campaign');
const { addHelpGrowBusiness } = require('./temporary');
const { withFilter } = require('aws-lambda-graphql');
const { addformJson, fetchformJson, fetchFormStructureById } = require('./FormJson');
const { addformData, fetchformData } = require('./FormData');
const { GraphQLJSON, GraphQLJSONObject } = require('graphql-type-json');
const { createVideoToken } = require('./videoCall');
const { generateCkEditorToken } = require('./auth');
const { GraphQLUpload } = require('graphql-upload');
const { pubSub } = require('../helpers/pubsub');

module.exports = {
  JSON: GraphQLJSON,
  JSONObject: GraphQLJSONObject,
  Upload: GraphQLUpload,
  Query: {
    hello: () => 'Hello world!',
    getUsers, getUserById,

    getAllPosts,
    fullSearch,
    fetchformJson, fetchformData, fetchFormStructureById,
    // getProductsByUserId,
    // getProductById,

    getComments, getCommentsByReferenceId, deleteComment, fetchLatestCommentsForTheUserEngaged,

    getPostsByUserIdAndType, getPostById, getPostsByType,

    findFromCollection,

    getMembershipSubscriptionsByUserId,

    getCompaniesByUserIdAndType, getCompanyById, getCompaniesByType, getListOfUsersInACompany, getEventsByCompanyId,

    fetchFields, fetchPostTypes,

    getCampaignsWithTracking,
    getCountOfAllPost,
    getEmailPhoneCountForContact,
    getPostByPostType,
    getCampaignEmails,
    // Chat Resolver
    createVideoToken,
    getMailingList
  },
  Mutation: {
    createUser,
    updateUser,
    authorize,
    generateCkEditorToken,
    createBraintreeTransaction,
    addMakeMoney,
    addToCollection,
    // addProduct,
    // updateProduct,
    // deleteProduct,
    addformJson, addformData,

    addComment,
    updateComment,

    addPost,
    updatePost,
    updatePostContent,
    deletePost,

    addMembershipSubscription,
    inviteMembersToSubscription,
    cancelSubscription,
    acceptInvitation,

    addCompany, updateCompany, deleteCompany,

    sendEmail,

    addPostType, updatePostType, deletePostType,

    addHelpGrowBusiness,
    getCsvFileData,
    getEmailData,
    saveCsvFileData
  },
  Subscription: {
    onCommentAdded: {
      resolve: (rootValue) => {
        // root value is the payload from sendMessage mutation
        return rootValue;
      },
      subscribe: withFilter(
        pubSub.subscribe('COMMENT_ADDED'),
        (rootValue, args) => {
          // this can be async too :)
          if (args.postId === rootValue.referenceId || args.companyId === rootValue.companyReferenceId || args.userId === rootValue.userReferenceId) {
            return true;
          }

          // return args.type === rootValue.type;
        },
      ),
    },
    onCommentUpdated: {
      resolve: (rootValue) => {
        // root value is the payload from sendMessage mutation
        // console.log('RooooooooooooooooT Value MAin', rootValue);
        return rootValue;
      },
      subscribe: withFilter(
        pubSub.subscribe('COMMENT_UPDATED'),
        (rootValue, args) => {
          // this can be async too :)
          // console.log('postIDDDDDDD  Outer', args.postId);
          // console.log('RooooooooooooooooT Value  Outer', rootValue);
          if (args.postId === rootValue.referenceId || args.companyId === rootValue.companyReferenceId || args.userId === rootValue.userReferenceId) {
            // console.log('=========================================================');
            // console.log('postIDDDDDDD', args.postId);
            // console.log('RooooooooooooooooT Value', rootValue);
            return true;
          }

          // return args.type === rootValue.type;
        },
      ),
    },
    onCommentDeleted: {
      resolve: (rootValue) => {
        // root value is the payload from sendMessage mutation
        return rootValue;
      },
      subscribe: withFilter(
        pubSub.subscribe('COMMENT_DELETED'),
        (rootValue, args) => {
          // this can be async too :)
          if (args.postId == rootValue.referenceId || args.companyId === rootValue.companyReferenceId || args.userId === rootValue.userReferenceId) {
            return true;
          }

          return false;
        },
      ),
    },
    onUserOnline: {
      resolve: (rootValue) => {
        // root value is the payload from sendMessage mutation
        delete rootValue['usersToBeNotified'];
        return rootValue;
      },
      subscribe: withFilter(
        pubSub.subscribe('LISTEN_NOTIFICATION'),
        (rootValue, args) => {
          if (rootValue.usersToBeNotified.indexOf(args.user._id) > -1) {
            return true;
          }
          return false;
        },
      ),
    },
  },

  // CommentInterface: {
  //   __resolveType(comment, context, info) {
  //     return comment;
  //   }
  // },


};
