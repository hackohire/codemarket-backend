const { getUsers, createUser, updateUser, authorize, getUsersAndBugFixesCount, getUserById, getMyProfileInfo } = require('./user');
const { getAllProducts, getListOfUsersWhoPurchased } = require('./product');
const { addComment, updateComment, getComments, getCommentsByReferenceId, deleteComment } = require('./comment');
const { addQuestionOrAnswer, updateQuestionOrAnswer, getQuestionAndAnswersByReferenceId, deleteQuestionOrAnswer } = require('./q&a');
const { findFromCollection } = require('./categories');
const { addTransaction, getPurchasedUnitsByUserId } = require('./purchase');
const { addToCart, removeItemFromCart, getCartItemsList } = require('./cart');
const { like, checkIfUserLikedAndLikeCount } = require('./like');
const { getAllPosts, addPost, getPostsByUserIdAndType, getPostById, getPostsByType, updatePost, deletePost, fullSearch } = require('./post');
const { addCompany, updateCompany, getCompaniesByUserIdAndType, getCompanyById, getCompaniesByType, deleteCompany, getListOfUsersInACompany, getEventsByCompanyId} = require('./company');
const { rsvpEvent, myRSVP, cancelRSVP } = require('./event');
const { scheduleCall, getBookingList } = require('./booking');
const { addMembershipSubscription, getMembershipSubscriptionsByUserId, inviteMembersToSubscription, acceptInvitation, cancelSubscription} = require('./subscription');
const { withFilter } = require('aws-lambda-graphql');
const { pubSub } = require('../helpers/pubsub');
module.exports = {
  Query: {
    hello: () => 'Hello world!',
    getUsers, getUsersAndBugFixesCount, getUserById, getMyProfileInfo,

    getAllPosts,
    fullSearch,

    getAllProducts, getListOfUsersWhoPurchased,
    // getProductsByUserId,
    // getProductById,

    getComments, getCommentsByReferenceId, deleteComment,

    getPostsByUserIdAndType, getPostById, getPostsByType,

    findFromCollection,

    getPurchasedUnitsByUserId,

    getCartItemsList,

    checkIfUserLikedAndLikeCount,

    getMembershipSubscriptionsByUserId,

    myRSVP,

    getCompaniesByUserIdAndType, getCompanyById, getCompaniesByType, getListOfUsersInACompany, getEventsByCompanyId,

    getBookingList,

    getQuestionAndAnswersByReferenceId, deleteQuestionOrAnswer
  },
  Mutation: {
    createUser,
    updateUser,
    authorize,

    // addProduct,
    // updateProduct,
    // deleteProduct,


    addComment,
    updateComment,

    addPost,
    updatePost,
    deletePost,

    addTransaction,

    addToCart,
    removeItemFromCart,

    like,

    addMembershipSubscription,
    inviteMembersToSubscription,
    cancelSubscription,
    acceptInvitation,

    rsvpEvent,

    cancelRSVP,

    addCompany, updateCompany, deleteCompany,

    scheduleCall,

    addQuestionOrAnswer, updateQuestionOrAnswer,

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
          if (args.postId === rootValue.referenceId) {
            return true;
          }

          // return args.type === rootValue.type;
        },
      ),
    },
    onCommentUpdated: {
      resolve: (rootValue) => {
        // root value is the payload from sendMessage mutation
        return rootValue;
      },
      subscribe: withFilter(
        pubSub.subscribe('COMMENT_UPDATED'),
        (rootValue, args) => {
          // this can be async too :)
          if (args.postId === rootValue.referenceId) {
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
          if (args.postId == rootValue.referenceId) {
            return true;
          }

          return false;
        },
      ),
    },
    onUserOnline: {
      resolve: (rootValue) => {
        // root value is the payload from sendMessage mutation
        return { onCommentAdded: rootValue.comment, post: rootValue.post };
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
    onCompanyUpdate: {
      resolve: (rootValue) => {
        // root value is the payload from sendMessage mutation
        return {companyUpdated: rootValue};
      },
      subscribe: withFilter(
        pubSub.subscribe('COMPANY_UPDATED'),
        (rootValue, args) => {
          // this can be async too :)
          if (args.companyId == rootValue._id) {
            return true;
          }

          return false;
        },
      ),
    }
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

        case 'embed':
          return 'EmbedBlock'

        case 'linkTool':
          return 'LinkToolBlock'

        default:
          console.log('default case')
          return null;
      }
    },
  },

};
