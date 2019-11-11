const { getUsers, createUser, updateUser, authorize, getUsersAndBugFixesCount, getUserById } = require('./user');
const { getAllProducts, getListOfUsersWhoPurchased } = require('./product');
const { addComment, updateComment, getComments, getCommentsByReferenceId, deleteComment } = require('./comment');
const { findFromCollection } = require('./categories');
const { addTransaction, getPurchasedUnitsByUserId } = require('./purchase');
const { addToCart, removeItemFromCart, getCartItemsList } = require('./cart');
const { like, checkIfUserLikedAndLikeCount } = require('./like');
const { getAllPosts, addPost, getPostsByUserIdAndType, getPostById, getPostsByType, updatePost, deletePost, fullSearch } = require('./post');
const { addCompany, updateCompany, getAllCompanies, getCompaniesByUserIdAndType, getCompanyById, getCompaniesByType, deleteCompany, getListOfUsersInACompany} = require('./company');
const { rsvpEvent, myRSVP, cancelRSVP } = require('./event');
const { scheduleCall, getBookingList } = require('./booking');
const { addMembershipSubscription, getMembershipSubscriptionsByUserId, inviteMembersToSubscription, acceptInvitation, cancelSubscription} = require('./subscription');

module.exports = {
  Query: {
    hello: () => 'Hello world!',
    getUsers, getUsersAndBugFixesCount, getUserById,

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

    getAllCompanies, getCompaniesByUserIdAndType, getCompanyById, getCompaniesByType, getListOfUsersInACompany,

    getBookingList
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

    scheduleCall

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

        default:
          console.log('default case')
          return null;
      }
    },
  },

};
