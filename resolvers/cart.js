const connectToMongoDB = require('../helpers/db');
const helper = require('../helpers/helper');
const sendEmail = require('../helpers/ses_sendTemplatedEmail');
const Cart = require('./../models/cart')();
let conn;


async function addToCart(_, { userId, referenceId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const item = {
                referenceId: referenceId,
                user: userId 
            }
            const cartItem = await new Cart(item);
            const savedcartItem = await cartItem.save(item);

            const cartList = await returnCartListItems(userId)

            return resolve(cartList);

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function getCartItemsList(_, { userId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const cartList = await returnCartListItems(userId);

            return resolve(cartList);

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function removeItemFromCart(_, { userId, referenceId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const deleteCartItem = await Cart.findOneAndDelete({referenceId: referenceId}).exec();

            console.log(deleteCartItem);

            const cartList = await returnCartListItems(userId);

            return resolve(cartList);

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function returnCartListItems(userId) {
    return new Promise(async (resolve, reject) => {
        try {

            const cartList = await Cart.find({user: userId}).
            populate({path: 'referenceId', populate: {path: 'tags'}}).populate('user').exec();

            return resolve(cartList);

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    })

}



module.exports = {
    addToCart,
    getCartItemsList,
    removeItemFromCart
}