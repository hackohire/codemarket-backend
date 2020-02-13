const connectToMongoDB = require('../helpers/db');
const Unit = require('../models/purchased_units')();
const Transaction = require('../models/transaction')();
const helper = require('../helpers/helper');
const Cart = require('./../models/cart')();
const Subscription = require('../models/subscription')();

let conn;

async function addTransaction(_, { transaction }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            console.log(transaction)
            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            // Adding "purchase_units" in separate collection
            if (transaction.purchase_units && transaction.purchase_units.length) {
                transaction.purchase_units = await helper.insertManyIntoPurchasedUnit(transaction.purchase_units);
            }

            if (transaction && transaction.subscription) {
                const sub = new Subscription(transaction.subscription)
                const insertedSub = await sub.save();
                transaction.subscription = insertedSub._id;
            }


            // Creating a Transaction Model
            const h = await new Transaction(transaction);

            // Saving the Transaction in the collection
            await h.save(transaction).then(async p => {
                if (p && p.purchase_units && p.purchase_units.length) {
                    const removedCount = await Cart.remove({user: transaction.purchasedBy}).exec();
                    console.log(removedCount);
                }

                if (p.subscription) {
                    p.populate('subscription').populate('purchasedBy').execPopulate().then(async (populatedTransaction) => {
                        return resolve(populatedTransaction);
                    })
                } else {
                // Populating "purchase_units" and and the product and inside the product "createdBy" & "tags" field
                p.populate({path: 'purchase_units', populate: {path: 'reference_id', populate: [{path: 'createdBy'}, {path: 'tags'}]}}).populate('purchasedBy').execPopulate().then(async (populatedTransaction) => {
                    
                    for (let i = 0; i < populatedTransaction.purchase_units.length; i++) {
                        const creatorEmail = populatedTransaction.purchase_units[i].reference_id.createdBy.email;
                        const creatorName = populatedTransaction.purchase_units[i].reference_id.createdBy.name;
                        const sellertPath = basePath + 'email-template/common-template';
                        const buyerPath = basePath + 'email-template/common-template';
    
                        const payLoadToBuyer = {
                            // NAME: populatedTransaction.purchasedBy.name,
                            // CREATOREMAIL: creatorEmail,
                            CONTENT: `Thank you for purchasing the bug-fix. Here is the email of the bug-fix author ${creatorEmail}. You can contact him/her for the support`,
                            SUBJECT: 'Bug-fix Purchased!'
                        };
    
                        await helper.sendEmail(populatedTransaction.purchasedBy.email, buyerPath, payLoadToBuyer);
    
                        const payLoadToAuthor = {
                            NAME: creatorName,
                            BUYERNAME: populatedTransaction.purchasedBy.name,
                            BUYER_EMAIL: populatedTransaction.purchasedBy.email,
                            CONTENT: `Your bug-fix has been purchased by ${populatedTransaction.purchasedBy.name}. This is his/her email ${creatorEmail}.`,
                            SUBJECT: 'Bug-fix Purchased!'
                        };
                        await helper.sendEmail(creatorEmail, sellertPath, payLoadToAuthor);
                    }
                
                    return resolve({ purchasedUnits: populatedTransaction.purchase_units });
                })
                }
            });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function getPurchasedUnitsByUserId(_, { userId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            // Populating Bugfix from the reference_id and the categories and the author of the bugfix
            const purchasedItems = await Unit.find({purchasedBy: userId})
                .populate({path: 'reference_id', populate: {path: 'tags'}})
                .populate({path: 'reference_id', populate: {path: 'createdBy'}}).exec()

            return resolve(purchasedItems);


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

module.exports = {
    addTransaction,
    getPurchasedUnitsByUserId
}