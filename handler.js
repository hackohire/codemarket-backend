// const { ApolloServer } = require('apollo-server-lambda');
const typeDefs = require('./schemas');
const resolvers = require('./resolvers');
const nodemailer = require('nodemailer');
const connectToMongoDB = require('./helpers/db');
// const auth = require('./helpers/auth');
const Cart = require('./models/cart')();
const helper = require('./helpers/helper');
var ObjectID = require('mongodb').ObjectID;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const urlMetadata = require('url-metadata');
const axios = require('axios');
const parser = require('./helpers/html-parser');
var moment = require('moment');
// var { demoTempate } = require('./email-template/demo-template');
global.basePath = __dirname + '/';
const { makeExecutableSchema } = require('graphql-tools');
const AWS = require('aws-sdk');
const EmailValidator = require('email-deep-validator');
const emailValidator = new EmailValidator();
const Contact = require('./models/contact')();

const sqs = new AWS.SQS({
    region: "us-east-1",
});

const {
    DynamoDBEventProcessor,
    DynamoDBConnectionManager,
    DynamoDBSubscriptionManager,
    Server,
} = require('aws-lambda-graphql');

AWS.config.update({
    secretAccessKey: process.env.AWS_SECRETKEY,
    accessKeyId: process.env.AWS_ACCESSKEY_ID,
    region: 'us-east-1'
});

/** serverless offline support */
const dynamoDbClient = new AWS.DynamoDB.DocumentClient({
    ...(process.env.IS_OFFLINE
        ? {
            endpoint: 'http://localhost:8000',
        }
        : {}),
});

const subscriptionManager = new DynamoDBSubscriptionManager({
    dynamoDbClient,
    subscriptionsTableName: process.env.SUBSCRIPTIONS,
    subscriptionOperationsTableName: process.env.SUBSCRIPTION_OPERATIONS
});
const connectionManager = new DynamoDBConnectionManager({
    // this one is weird but we don't care because you'll use it only if you want to use serverless-offline
    // why is it like that? because we are extracting api gateway endpoint from received events
    // but serverless offline has wrong stage and domainName values in event provided to websocket handler
    // so we need to override the endpoint manually
    // please do not use it otherwise because we need correct endpoint, if you use it similarly as dynamoDBClient above
    // you'll end up with errors
    apiGatewayManager: process.env.IS_OFFLINE
        ? new AWS.ApiGatewayManagementApi({
            endpoint: 'http://localhost:3001',
        })
        : undefined,
    dynamoDbClient,
    subscriptions: subscriptionManager,
    connectionsTable: process.env.CONNECTIONS
});

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
})

/** Server, from which, websocket, http, and event handler can get created */
const server = new Server({
    connectionManager,
    eventProcessor: new DynamoDBEventProcessor(),
    schema,
    // resolvers,
    subscriptionManager,
    // typeDefs,
});

// const server = new ApolloServer({
//     cors: true,
//     schema,
//     context: async ({ event, context }) => {
//         // detect event type
//         if (event.Records != null) {
//             // event is DynamoDB stream event
//             return eventProcessor(event, context, null);
//         }
//         else if (
//             (event.requestContext != null) &&
//             (event.requestContext.routeKey != null)
//         ) {
//             // event is web socket event from api gateway v2
//             return wsHandler(event, context);
//         }

//         else {
//             // event is http event from api gateway v1
//             event['decodedToken'] = event.headers && event.headers.Authorization ? await auth.auth(event.headers) : null;
//             context['callbackWaitsForEmptyEventLoop'] = false;
//             return httpHandler(event, context, null);
//         }

//         // return {
//         //     callbackWaitsForEmptyEventLoop: false,
//         //     headers: event.headers,
//         //     functionName: context.functionName,
//         //     event,
//         //     context,
//         //     decodedToken: event.headers && event.headers.Authorization ? await auth.auth(event.headers) : null,
//         //     db: await connectToMongoDB()
//         // }
//     },
//     introspection: true,
//     playground: true,
// });



// const graphqlHandler = server.createHandler({
//     cors: {
//         origin: '*',
//         credentials: true,
//     },
// })


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
            const filePath = basePath + 'email-template/common-template';
            const payLoad = {
                NAME: body.name,
                // PLAN_NAME: sub.plan.nickname,
                CONTENT: `You have successfully subscribed for ${sub.plan.nickname}.`,
                SUBJECT: 'Thanks for choosing us!',
            };
            await helper.sendEmail({to: [body.metadata.email]}, filePath, payLoad);

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

/** Function to fetch the meta data of the webpage basedon thegiven link */
const fetchLinkMeta = async (event, context) => {
    return new Promise(async (resolve, reject) => {
        try {

            const url = event.queryStringParameters.url;

            urlMetadata(url).then(
                function (metadata) { // success handler
                    console.log(metadata);
                    const meta = {
                        description: metadata['og:description'],
                        domain: metadata.source,
                        image: {
                            url: metadata.image
                        },
                        title: metadata.title,
                        url: metadata.url

                    }
                    return resolve({
                        statusCode: 200,
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Credentials': true,
                        },
                        body: JSON.stringify({ meta, success: 1 })
                    });
                },
                function (error) { // failure handler
                    console.log(error);
                    return reject(error);
                })

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    })
}

const emailCampaignEvent = async (event, context) => {
    return new Promise(async (resolve, reject) => {
        try {
            let conn = await connectToMongoDB();
        
            // console.log('Received event:', JSON.stringify(event, null, 2));
        
            const message = event.Records[0].Sns.Message;
            
            console.log('From SNS:', message);
        
            const parsedMessage = JSON.parse(message);
        
            console.log('parsedMessage', parsedMessage)
        
            const savedEvent = await conn.collection('emails').updateOne(
                { campaignId: ObjectID(parsedMessage.mail.tags.campaignId[0]), to: parsedMessage.mail.destination[0]},
                { $push: { tracking: parsedMessage }}
            )
        
            // const savedEvent = await conn.collection('email-tracking').insertOne(parsedMessage);
        
            console.log('Saved Email Tracking Event', savedEvent)
        
            return resolve(message);
        } catch (err) {
            console.log("this is errror ==> ", err);
            return reject(err);
        }
    })
};


/** Function to fetch the HTML Content of the webpage based on the given link */
const fetchArticleByLink = (event, context) => {
    return new Promise(async (resolve, reject) => {
        try {

            const url = event.queryStringParameters.url;

            let articleHtml = '';
            let title = '';
            const mediumRegex = /https?:\/\/medium\.com\/([^/?&]*)\/([^/?&]*)/
            const meetupRegex = /https?:\/\/(?:www\.|(?!www))meetup\.com\/([^/?&]*)\/events\/([^/?&]*)/
            const indeedRegex = /https?:\/\/(?:www\.|(?!www))indeed\.co\.in\/viewjob([^/?&]*)/
            const githubJobsRegex = /https?:\/\/jobs\.github\.com\/positions\/([^/?&]*)/
            const linkedInJobsRegex = /https?:\/\/(?:www\.|(?!www))linkedin\.com\/jobs\/view\/([^/?&]*)/
            if (url.match(mediumRegex)) {
                /** Fetch the data from the URL */
                const result = await axios.get(url);
                const h = result.data;
                const post = await parser.parseMediumArticle(h);
                articleHtml = post.html;
                title = post.title;
            } else if (url.match(meetupRegex)) {
                const result = await axios.get(url);
                const h = result.data;
                const post = await parser.parseMeetupEvent(h);
                articleHtml = post.html;
                title = post.title;
            } else if (url.match(indeedRegex)) {
                const result = await axios.get(url);
                const h = result.data;
                const post = await parser.parseJob(h, '.jobsearch-ViewJobLayout-jobDisplay');
                articleHtml = post.html;
                title = post.title;
            } else if (url.match(githubJobsRegex)) {
                const result = await axios.get(url);
                const h = result.data;
                const post = await parser.parseJob(h, '.inner');
                articleHtml = post.html;
                title = post.title;
            } else if (url.match(linkedInJobsRegex)) {
                const result = await axios.get(url);
                const h = result.data;
                const post = await parser.parseJob(h, '.description');
                articleHtml = post.html;
                title = post.title;

            }

            return resolve({
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Credentials': true,
                },
                body: JSON.stringify({ contentHtml: articleHtml, title})
            });
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    })
}



const receiveMessageFromQueue = (event, context) => {
    return new Promise(async (resolve, reject) => {
        console.log("This is event ", event);
        console.log("this is context " , context);
        try {
            const transporter = await nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD
                },
                debug: true,
                secure: true
            });
            console.log("This is transporter ==> ", transporter);
            const emailSent = await transporter.sendMail(JSON.parse(event.Records[0].body));

            if (emailSent) {
                console.log("Email is sent ==> ", emailSent);
                return resolve(true);
            } else {
                console.log("Email is Fail ==> ", emailSent);
                return reject(false);
            }

        } catch (err) {
            console.log(err);
            return reject(false);
        }
    });
}

const validateEmail = (event, context) => {
    return new Promise(async (resolve, reject) => {
        console.log("Data Is ==> ", event.Records[0].body);
        const emailData = JSON.parse(event.Records[0].body);

        let conn = await connectToMongoDB();

        console.log("This is email Data => ", emailData);
        async function validEmail(emails) {
            console.log("Inside validEmail function ==> ", emails);
            return new Promise((resolve1, reject) => {
                var emailObj = [];
                async function run1(data, index) {
                    console.log("inside run1 function ==> ", index, data.length);
                    if (index < data.length) {
                            emailValidator.verify(data[index]).then(async (res) => {
                                console.log("************************** ", res);
                                if (res.wellFormed && res.validDomain) {
                                    console.log("true email ==> ", data[index]);
                                    emailObj.push({email: data[index], status: true});
                                } else {
                                    console.log("false email ==> ", data[index]);
                                    emailObj.push({email: data[index], status: false});
                                }
                                index += 1;
                                await run1(data, index);
                            })
                            .catch(async (err) => {
                                console.log("Error while validating an email==> ", err);
                                emailObj.push({email: data[index], status: false});
                                index += 1;
                                await run1(data, index);
                            });
                    } else {
                        console.log("Resolve1 ==> ", emailObj);
                        resolve1(emailObj);
                    }
                }
                console.log("Run1 is called");
                run1(emails, 0)
            })
        }

        async function run(data, index) {
            console.log("Inside run function ==> ", data.email);
            validEmail(data.email).then(async (e) => {
                console.log("After validation emails ==> ", e);

                data.email = e;
                console.log("This is data before save ==>", data);

                const result = new Contact(data);
                console.log("This is result ==>", result);
                
                result.save().then(async () => {
                    resolve(true);
                })
            }).catch(err => {
                console.log("ee", index, err);
            });
        }
        console.log("Run is called");
        run(emailData, 0)

    });
}

const testCron2 = (event, context) => {
    return new Promise(async (resolve, reject) => {
        console.log("*********** NEW est CRON ************");
        let conn = await connectToMongoDB();

        console.log("process.env.MONGODB_URL  ==> ", process.env.MONGODB_URL);
        let result = [];
        const queueUrl = "https://sqs.us-east-1.amazonaws.com/784380094623/normal";
        
        if (process.env.MONGODB_URL) {
            result = await conn.collection('contacts').aggregate([
                {
                    $match: {
                        batch: 'new_therapist'        
                    }
                },
                {
                    $project: {
                        companyName: 1,
                        // cityName: 1,
                        name: 1,
                        // OrganizatinName : 1,
                        // proposalName: 1,
                        email: {
                             $filter: {
                                    input: "$email",
                                    as: "e",
                                    cond: { $eq: ["$$e.status", true]}
                                }
                        }
                    }
                   
                },
                {
                    $match: {
                        email: { $gt: {$size : 0}}
                    },
                }
            ]).toArray();
            
            const emails = [
                {
                    name: 'Jay Sojitra',
                    firstName: 'Jay',
                    companyName: "Oren Hen EA",
                    "email": [
                      {
                        email: 'jaysojitra13@gmail.com',
                        status: true
                      },
                      {
                        email: '13jay96@gmail.com',
                        status: true
                      }
                  ]
                },
                {
                  name: 'Sumit Vekariya',
                  firstName: 'Sumit',
                  companyName: "Burk's Custom Painting",
                  email: [
                    {
                      email: 'sumitvekariya7@gmail.com',
                      status: true
                    },
                    {
                        email: 'sarkazein7@gmail.com',
                        status: true
                    },
                ]
                },
            ];

            finalInstaEmails.forEach((e, i) => {
                setTimeout(() => {
                    e.email.forEach((email, j) => {
                        setTimeout(() => {
                            const emailObj = {
                                to: [email.email],
                                subject: `${e.companies}, Test Email`, // Therapist
                                companies: [{ _id: '5db1c84ec10c45224c4b95fd' }],
                                type: 'email',
                                status: 'Published',
                                // descriptionHTML: demoTempate.replace('{companyName}', e.companyName),
                                createdBy: '5d4c1cdf91e63a3fe84bb43a',
                                campaignId: '5ec800f9870915348a37f30f', // instagram
                            };

                            const params = {
                                MessageBody: JSON.stringify(emailObj),
                                QueueUrl: queueUrl,
                            };

                            sqs.sendMessage(params, (error, data) => {
                                if (error) {
                                    console.log("Error while sending ==> ", error);
                                } else {
                                    console.log("Success while sending ==> ", data);
                                }
                            });  

                        }, i * 1000);
                    })
                }, I * 1000);
            });
        }

        await resolve(true);
    });
}
module.exports = {
    // graphqlHandler,
    handler: server.createHttpHandler({
        cors: {
            origin: '*',
            credentials: true,
        },
    }),
    handleWebSocket: server.createWebSocketHandler(),
    handleDynamoDBStream: server.createEventHandler(),
    checkoutSessionCompleted,
    createCheckoutSession,
    getCheckoutSession,
    createStripeUser,
    attachCardAndCreateSubscription,
    getCouponByName,
    fetchLinkMeta,
    fetchArticleByLink,
    receiveMessageFromQueue,
    validateEmail,
    // testCron1,
    testCron2,
    emailCampaignEvent
};
