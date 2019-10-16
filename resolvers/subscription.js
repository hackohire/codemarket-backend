const connectToMongoDB = require('../helpers/db');
const Subscription = require('../models/subscription')();
const helper = require('../helpers/helper');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
var ObjectID = require('mongodb').ObjectID;
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
            const subscriptions = await Subscription.find({
                $or: [
                    { "metadata.userId": { $eq: ObjectID(userId)}, status: { $ne: 'canceled' }},
                    { 'subscriptionUsers.email': decodedToken.email, status: { $ne: 'canceled' }}
                ]
            })
                .populate({ path: 'metadata.userId' }).exec()

            return resolve(subscriptions);


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

/** Lambda Function to send the invitation to the users, which adds the users into subscription and also send invitation email to each users. */
async function inviteMembersToSubscription(_, { subscriptionId, users }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const subscription = await Subscription.findOneAndUpdate({ _id: subscriptionId }, { $set: { subscriptionUsers: users } }, { new: true })
                .populate({ path: 'metadata.userId' }).exec();

            if (subscription && subscription.subscriptionUsers && subscription.subscriptionUsers.length) {
                subscription.subscriptionUsers.forEach(async (u) => {
                    /** Send Email for Invitation */
                    const filePath = basePath + 'email-template/subscriptionInvitation';
                    var invitationLink = process.env.FRONT_END_URL + `(main:dashboard)?subscriptionId=${subscriptionId}&email=${u.email}`;
                    // var attendee = subscription.subscriptionUsers.find(u => u.email === email);
                    const payLoad = {
                        INVITEE: u.name,
                        BUYER: subscription.metadata.userId.name,
                        INVITATION_LINK: invitationLink,
                    };
                    await helper.sendEmail(u.email, filePath, payLoad);
                })
            }
            return await resolve(subscription);


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}
/** Lambda Function to accept the invitation which was sent while adding the user to the subscription by the buyer */
async function acceptInvitation(_, { subscriptionId, email }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const subscription = await Subscription.findOneAndUpdate({ _id: subscriptionId, 'subscriptionUsers.email': email }, { $set: { 'subscriptionUsers.$.invitationAccepted': true } }, { new: true })
                .populate({ path: 'metadata.userId' }).exec();

            return resolve(subscription);


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

const cancelSubscription = async (_, { subscriptionId }, { headers, db, decodedToken }) => {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            let cancelledSubscription = await stripe.subscriptions.del(subscriptionId);

            if (cancelledSubscription) {
                cancelledSubscription = await Subscription.findOneAndUpdate({id: subscriptionId}, cancelledSubscription, {new: true}).exec();
            }

            return resolve(cancelledSubscription);

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    })
}


module.exports = {
    addMembershipSubscription,
    getMembershipSubscriptionsByUserId,
    inviteMembersToSubscription,
    acceptInvitation,
    cancelSubscription
}