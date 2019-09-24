const { getUsers, createUser, updateUser, authorize, getUsersAndBugFixesCount, getUserById } = require('./user');
const { addProduct, updateProduct, deleteProduct, getAllProducts, getProductsByUserId, getProductById, getListOfUsersWhoPurchased } = require('./product');
const { addComment, updateComment, getComments, getCommentsByReferenceId, deleteComment } = require('./comment')
const { searchCategories } = require('./categories');
const { addTransaction, getPurchasedUnitsByUserId } = require('./purchase');
const { addToCart, removeItemFromCart, getCartItemsList } = require('./cart');
const { like, checkIfUserLikedAndLikeCount } = require('./like');
const { getAllPosts, addPost, getPostsByUserIdAndType, getPostById, getPostsByType, updatePost, deletePost } = require('./post');
const { addMembershipSubscription, getMembershipSubscriptionsByUserId } = require('./paypal-subscription');

module.exports = {
  Query: {
    hello: () => 'Hello world!',
    getUsers,
    getUsersAndBugFixesCount,
    getUserById,

    getAllPosts,

    getAllProducts,
    getProductsByUserId,
    getProductById,
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

    getMembershipSubscriptionsByUserId

  },
  Mutation: {
    createUser,
    updateUser,
    authorize,

    addProduct,
    updateProduct,
    deleteProduct,


    addComment,
    updateComment,

    addPost,
    updatePost,
    deletePost,

    addTransaction,

    addToCart,
    removeItemFromCart,

    like,

    addMembershipSubscription

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
