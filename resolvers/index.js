const { getUsers, createUser, updateUser, authorize, getUsersAndBugFixesCount, getUserById } = require('./user');
const { getListOfUsersWhoPurchased } = require('./product');
const { addComment, updateComment, getComments, getCommentsByReferenceId, deleteComment, fetchLatestCommentsForTheUserEngaged } = require('./comment');
const { addQuestionOrAnswer, updateQuestionOrAnswer, getQuestionAndAnswersByReferenceId, deleteQuestionOrAnswer } = require('./q&a');
const { findFromCollection, addToCollection } = require('./categories');
const { addTransaction, getPurchasedUnitsByUserId } = require('./purchase');
const { addToCart, removeItemFromCart, getCartItemsList } = require('./cart');
const { like, checkIfUserLikedAndLikeCount } = require('./like');
const { getAllPosts, addPost, getPostsByUserIdAndType, getPostById, getPostsByType, updatePost, deletePost, fullSearch, fetchFiles, getCountOfAllPost, getEmailPhoneCountForContact, saveContact } = require('./post');
const { addCompany, updateCompany, getCompaniesByUserIdAndType, getCompanyById, getCompaniesByType, deleteCompany, getListOfUsersInACompany, getEventsByCompanyId} = require('./company');
const { rsvpEvent, myRSVP, cancelRSVP } = require('./event');
const { scheduleCall, getBookingList } = require('./booking');
const { sendEmail } = require('./email');
const { addMakeMoney } = require('./makeMoney');
const { addMembershipSubscription, getMembershipSubscriptionsByUserId, inviteMembersToSubscription, acceptInvitation, cancelSubscription} = require('./subscription');
const { fetchFields, fetchPostTypes, addPostType, updatePostType, deletePostType  } = require('./post-type');
const { getCampaignsWithTracking, getCampaignEmails } = require('./campaign');
const { withFilter } = require('aws-lambda-graphql');
const { pubSub } = require('../helpers/pubsub');
const {addformJson, fetchformJson} = require('./FormJson');
const {addformData, fetchformData} = require('./FormData');
module.exports = {
  Query: {
    hello: () => 'Hello world!',
    getUsers, getUsersAndBugFixesCount, getUserById,

    getAllPosts,
    fullSearch,
    fetchformJson,fetchformData,
    getListOfUsersWhoPurchased,
    // getProductsByUserId,
    // getProductById,

    getComments, getCommentsByReferenceId, deleteComment, fetchLatestCommentsForTheUserEngaged,

    getPostsByUserIdAndType, getPostById, getPostsByType, fetchFiles,

    findFromCollection,

    getPurchasedUnitsByUserId,

    getCartItemsList,

    checkIfUserLikedAndLikeCount,

    getMembershipSubscriptionsByUserId,

    myRSVP,

    getCompaniesByUserIdAndType, getCompanyById, getCompaniesByType, getListOfUsersInACompany, getEventsByCompanyId,

    getBookingList,

    getQuestionAndAnswersByReferenceId, deleteQuestionOrAnswer,

    fetchFields, fetchPostTypes,

    getCampaignsWithTracking,
    getCountOfAllPost,
    getEmailPhoneCountForContact,
    getCampaignEmails
  },
  Mutation: {
    createUser,
    updateUser,
    authorize,
    addMakeMoney,
    addToCollection,
    // addProduct,
    // updateProduct,
    // deleteProduct,
    addformJson,addformData,

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

    sendEmail,

    addPostType, updatePostType, deletePostType
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
        return { onCommentAdded: rootValue.comment, };
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

        case 'delimiter':
          return 'ParagraphBlock'

        case 'attaches':
          return 'AttachesBlock'

        default:
          console.log('default case')
          return null;
      }
    },
  },

};
