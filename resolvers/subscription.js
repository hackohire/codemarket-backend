const connectToMongoDB = require('../helpers/db');
const Subscription = require('../models/subscription')();
const helper = require('../helpers/helper');
let conn;

async function addMembershipSubscription(_, { subscription }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            console.log(subscription)
            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            // Creating a Subscription Model
            const h = new Subscription(subscription);

            // Saving the Subscription in the collection
            await h.save(subscription).then(async p => {

                p.populate('purchasedBy').execPopulate().then(async (populatedSubscription) => {

                    // const creatorEmail = populatedSubscription.purchase_units[i].reference_id.createdBy.email;
                    // const buyerPath = basePath + 'email-template/bugFixPurchaseToBuyer';

                    // const payLoadToBuyer = {
                    //     BUYERNAME: populatedSubscription.purchasedBy.name,
                    //     CREATOREMAIL: creatorEmail
                    // };

                    // await helper.sendEmail(populatedSubscription.purchasedBy.email, buyerPath, payLoadToBuyer);

                    return resolve(populatedSubscription);
                })
            });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function getMembershipSubscriptionsByUserId(_, { userId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            // Populating Bugfix from the reference_id and the categories and the author of the bugfix
            const subscriptions = await Subscription.find({})
                .populate({ path: 'metadata.userId' }).exec()

            return resolve(subscriptions);


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

module.exports = {
    addMembershipSubscription,
    getMembershipSubscriptionsByUserId
}