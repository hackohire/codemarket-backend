const { getUsers, createUser, updateUser, authorize, getUsersAndBugFixesCount, getUserById } = require('./user');
const { getAllProducts, getListOfUsersWhoPurchased } = require('./product');
const { addComment, updateComment, getComments, getCommentsByReferenceId, deleteComment } = require('./comment');
const { searchCategories } = require('./categories');
const { addTransaction, getPurchasedUnitsByUserId } = require('./purchase');
const { addToCart, removeItemFromCart, getCartItemsList } = require('./cart');
const { like, checkIfUserLikedAndLikeCount } = require('./like');
const { getAllPosts, addPost, getPostsByUserIdAndType, getPostById, getPostsByType, updatePost, deletePost } = require('./post');
const { rsvpEvent, myRSVP, cancelRSVP } = require('./event');
const { addMembershipSubscription, getMembershipSubscriptionsByUserId, inviteMembersToSubscription, acceptInvitation } = require('./subscription');

module.exports = {
  Query: {
    hello: () => 'Hello world!',
    getUsers,
    getUsersAndBugFixesCount,
    getUserById,

    getAllPosts,

    getAllProducts,
    // getProductsByUserId,
    // getProductById,
    getListOfUsersWhoPurchased,

    getComments,
    getCommentsByReferenceId,
    deleteComment,

    getPostsByUserIdAndType,
    getPostById,
    getPostsByType,

    searchCategories,

    getPurchasedUnitsByUserId,

    getCartItemsList,

    checkIfUserLikedAndLikeCount,

    getMembershipSubscriptionsByUserId,

    myRSVP

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
    acceptInvitation,

    rsvpEvent,

    cancelRSVP

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
