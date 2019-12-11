const { getUsers, createUser, updateUser, authorize, getUsersAndBugFixesCount, getUserById, getMyProfileInfo } = require('./user');
const { getAllProducts, getListOfUsersWhoPurchased } = require('./product');
const { addComment, updateComment, getComments, getCommentsByReferenceId, deleteComment } = require('./comment');
const { addQuestionOrAnswer, updateQuestionOrAnswer, getQuestionAndAnswersByReferenceId, deleteQuestionOrAnswer } = require('./q&a');
const { findFromCollection } = require('./categories');
const { addTransaction, getPurchasedUnitsByUserId } = require('./purchase');
const { addToCart, removeItemFromCart, getCartItemsList } = require('./cart');
const { like, checkIfUserLikedAndLikeCount } = require('./like');
const { getAllPosts, addPost, getPostsByUserIdAndType, getPostById, getPostsByType, updatePost, deletePost, fullSearch } = require('./post');
const { addCompany, updateCompany, getCompaniesByUserIdAndType, getCompanyById, getCompaniesByType, deleteCompany, getListOfUsersInACompany} = require('./company');
const { rsvpEvent, myRSVP, cancelRSVP } = require('./event');
const { scheduleCall, getBookingList } = require('./booking');
const { addMembershipSubscription, getMembershipSubscriptionsByUserId, inviteMembersToSubscription, acceptInvitation, cancelSubscription} = require('./subscription');

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

    getCompaniesByUserIdAndType, getCompanyById, getCompaniesByType, getListOfUsersInACompany,

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
