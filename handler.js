const { ApolloServer } = require('apollo-server-lambda');
const typeDefs = require('./schemas');
const resolvers = require('./resolvers');
const connectToMongoDB = require('./helpers/db');
const auth = require('./helpers/auth');
const Cart = require('./models/cart')();
const helper = require('./helpers/helper');
var ObjectID = require('mongodb').ObjectID;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

global.basePath = __dirname + '/';

const server = new ApolloServer({
    cors: true,
    typeDefs,
    resolvers,
    context: async ({ event, context }) => ({
        callbackWaitsForEmptyEventLoop: false,
        headers: event.headers,
        functionName: context.functionName,
        event,
        context,
        decodedToken: event.headers && event.headers.Authorization ? await auth.auth(event.headers) : null,
        db: await connectToMongoDB()
    }),
    introspection: true,
    playground: true,
});

const graphqlHandler = server.createHandler({
    cors: {
        origin: '*',
        credentials: true,
    },
})

const checkoutSessionCompleted = async (event, context) => {
    return new Promise(async (resolve, reject) => {
        try {

            // parse body
            let body;
            try {
                body = JSON.parse(event.body);
            } catch (e) {
                body = {};
            }
            let conn = await connectToMongoDB();

            const session = body;

            // const { session_id } = body;
            // const session = await stripe.checkout.sessions.retrieve(session_id);

            if (session.data.object.mode === 'subscription') {
                await conn.collection('stripe_subscription').insertOne(session);
            } else {
                await conn.collection('stripe_purchases').insertOne(session);
                const removedCount = await Cart.remove({ user: session.data.object.client_reference_id }).exec();
                console.log(removedCount);
            }


            return resolve({
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true,
                },
                body: JSON.stringify({
                    session
                })
            });
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    })
}

const getCheckoutSession = async (event, context) => {
    return new Promise(async (resolve, reject) => {
        try {

            // parse body
            let body;
            try {
                body = JSON.parse(event.body);
            } catch (e) {
                body = {};
            }
            let conn = await connectToMongoDB();

            // const session = body;

            const { session_id, type } = body;
            let session;
            // const session = await stripe.checkout.sessions.retrieve(session_id);

            try {
                if (type === 'subscription') {
                    session = await conn.collection('stripe_subscription').findOne({ 'data.object.id': session_id });
                } else {
                    session = await conn.collection('stripe_purchases').findOne({ 'data.object.id': session_id });
                }
                return resolve({
                    statusCode: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Credentials': true,
                    },
                    body: JSON.stringify({
                        session
                    })
                });
            } catch (e) {
                console.log('checkoutSessionCompleted webhook failed', e)
                return reject(e);
            }
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    })
}

const createCheckoutSession = async (event, context) => {
    return new Promise(async (resolve, reject) => {
        try {

            /** parse body */
            let body;
            try {
                body = JSON.parse(event.body);
            } catch (e) {
                body = {};
            }

            let session;

            stripe.checkout.sessions.create(body).then((d) => {
                session = d;
                return resolve({
                    statusCode: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Credentials': true,
                    },
                    body: JSON.stringify({ session })
                });
            })
                .catch((e) => {
                    console.log(e);
                    return reject(e);
                })
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    })
}

const createStripeUser = async (event, context) => {
    return new Promise(async (resolve, reject) => {
        try {

            /** parse body */
            let body;
            try {
                body = JSON.parse(event.body);
            } catch (e) {
                body = {};
            }

            let conn = await connectToMongoDB();


            const customer = await stripe.customers.create({
                email: body.email,
                name: body.name,
                metadata: { codemarketUserId: body.loggedInUserId }
            });

            const user = await conn.collection('users')
                .findOneAndUpdate(
                    { _id: ObjectID(body.loggedInUserId) },
                    { $set: { stripeId: customer.id } },
                    { returnOriginal: false }
                );

            return resolve({
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true,
                },
                body: JSON.stringify({ user: user.value })
            });

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    })
}

// Attach Card to a User
const attachCardAndCreateSubscription = async (event, context) => {
    return new Promise(async (resolve, reject) => {
        try {

            /** parse body */
            let body;
            try {
                body = JSON.parse(event.body);
            } catch (e) {
                body = {};
            }

            let conn = await connectToMongoDB();


            const source = await stripe.customers.createSource(body.stripeId, {
                source: body.source
            });

            if (!source) {
                throw new Error('Stripe Failed to Attcah Card');
            }

            const subscriptionDetails = {
                customer: body.stripeId,
                items: body.items,
                metadata: body.metadata
            };

            if (body.coupon) {
                subscriptionDetails.coupon = body.coupon.toUpperCase();
            }

            if (body.trial_period_days) {
                subscriptionDetails.trial_period_days = body.trial_period_days
            }
            const sub = await stripe.subscriptions.create(subscriptionDetails);

            sub.metadata.userId = ObjectID(subscriptionDetails.metadata.userId);
            /** Store Subscription in stripe-subscriptions collection */
            await conn.collection('stripe_subscriptions').insertOne(sub);

            /** Send Email */
            const filePath = basePath + 'email-template/successfulSubscription';
            const payLoad = {
                AUTHORNAME: body.name,
                PLAN_NAME: sub.plan.nickname
            };
            await helper.sendEmail(body.metadata.email, filePath, payLoad);

            return resolve({
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true,
                },
                body: JSON.stringify({ subscription: sub })
            });

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    })
}

const getCouponByName = async (event, context) => {
    return new Promise(async (resolve, reject) => {
        try {

            /** parse body */
            let body;
            try {
                body = JSON.parse(event.body);
            } catch (e) {
                body = {};
            }

            // let conn = await connectToMongoDB();

            const couponCode = body.couponCode.toUpperCase();

            stripe.coupons.retrieve(
                couponCode,
                function (err, coupon) {

                    if (err) {
                        return reject(err);
                    } else {
                        return resolve({
                            statusCode: 200,
                            headers: {
                                'Access-Control-Allow-Origin': '*',
                                'Access-Control-Allow-Credentials': true,
                            },
                            body: JSON.stringify({ coupon })
                        });
                    }
                }
            );

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    })
}



module.exports = {
    graphqlHandler,
    checkoutSessionCompleted,
    createCheckoutSession,
    getCheckoutSession,
    createStripeUser,
    attachCardAndCreateSubscription,
    getCouponByName
};
