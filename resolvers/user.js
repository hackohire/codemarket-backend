const connectToMongoDB = require('./../helpers/db');
const User = require('./../models/user')();
var ObjectID = require('mongodb').ObjectID;
const Subscription = require('../models/subscription')();
const helper = require('../helpers/helper');
const auth = require('../helpers/auth');
let conn;

async function getUsers(_, { _page = 1, _limit = 10 }, { headers, db, decodedToken }) {
    console.log(decodedToken);
    return new Promise(async (resolve, reject) => {
        try {
            // console.log(headers);
            // await auth.auth(headers);
            console.log(db)
            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const users = await User.find()
                .limit(_limit)
                .skip((_page - 1) * _limit);

            // await db.disconnect();
            return resolve(users);

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function createUser(_, { user }, { db, event }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }


            let options = { upsert: true, new: false, };

            // const userToBeSaved = new User(user);
            // const userSaved = await userToBeSaved.save();
            // console.log(userSaved);

            await User.update({ email: user.email }, { $setOnInsert: { name: user.name } }, options, async (err, u) => {
                if (err) {
                    return (err);
                }

                if (u) {

                    if (u.upserted) {
                        const filePath = basePath + 'email-template/common-template';

                        let authUser = await auth.auth(event.headers);

                        /** Creating dynamic varibales such as link, subject and email content */
                        const payLoad = {
                            NAME: user.email,
                            CONTENT: authUser.name + ' has invited you to join Codemarket',
                            LINK: process.env.FRONT_END_URL,
                            SUBJECT: 'Join Codemarket Comment!'
                        };

                        /** Sending the email */
                        await helper.sendEmail({ to: [user.email] }, filePath, payLoad);
                        user['_id'] = u.upserted[0]._id.toString();

                    } else {
                        const userFound = await User.findOne({ email: user.email }).exec();
                        user['_id'] = userFound._id;
                    }


                    return resolve(user);
                }

                // await db.disconnect();

            });

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function updateUser(_, { user }, { headers, db }) {
    return new Promise(async (resolve, reject) => {
        try {
            // await auth(headers);

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            // const userToBeSaved = await new User(user);
            await User.findByIdAndUpdate(user._id, user, { new: true })
                .populate('currentJobDetails.company')
                .populate('currentJobDetails.jobProfile')
                .then(userCreated => {
                    console.log(userCreated)
                    return resolve(userCreated);
                });

            // await db.disconnect();
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function authorize(_, { applicationId }, { event, context, headers, db, }) {
    return new Promise(async (resolve, reject) => {
        try {

            let u = await auth.auth(event.headers);
            let user = {
                'email': u.email,
                'name': u.name,
                'roles': ['User'],
                'applications': [applicationId]
            }

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }


            // let options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };

            let userFound = await User.findOne({ email: u.email })
                .populate('currentJobDetails.jobProfile')
                .populate('currentJobDetails.company')
                .exec();

            if (userFound) {
                // const userFound = await userFound.save(userFound);
                const subscriptions = await Subscription.find({
                    $or: [
                        { "metadata.userId": { $eq: ObjectID(userFound._id) }, status: { $ne: 'canceled' } },
                        { 'subscriptionUsers.email': u.email, status: { $ne: 'canceled' } }
                    ]
                }).exec();
                userFound['subscription'] = subscriptions;
            } else {
                u = new User(user);
                userFound = u.save(u);
            }

            resolve(userFound);

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

// Lambda Function to get the user Data by Id
async function getUserById(_, { userId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {
            // const decodedToken = await auth.auth(headers);
            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }


            // Getting user Data by passing the userId
            await User.findById(userId).populate('currentJobDetails.jobProfile').populate('currentJobDetails.company').exec(async (err, res) => {

                // if error, reject with error
                if (err) {
                    return reject(err)
                }

                return resolve(res);
            });

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

const createTransaction = async (_, { data }) => {
    return new Promise(async (resolve, reject) => {
        try {

            conn = await connectToMongoDB();

            const insertedTransaction = await conn.collection('donations').insertOne(data);
            console.log('insertedTransaction', insertedTransaction);

            return resolve(data);

            // Getting user Data by passing the userId
            // await conn.findById(userId).populate('currentJobDetails.jobProfile').populate('currentJobDetails.company').exec(async (err, res) => {

            //     // if error, reject with error
            //     if (err) {
            //         return reject(err)
            //     }

            //     return resolve(res);
            // });

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}



module.exports = {
    getUsers,
    createUser,
    updateUser,
    authorize,
    getUserById,
    createTransaction
};
