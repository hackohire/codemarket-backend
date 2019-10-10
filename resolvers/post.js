const connectToMongoDB = require('../helpers/db');
const Product = require('../models/product')();
// const HelpRequest = require('../models/help')();
// const Interview = require('../models/interview')();
// const Requirement = require('../models/requirement')();
// const Testing = require('../models/testing')();
// const Design = require('../models/design')();
// const Howtodoc = require('../models/how-to-doc')();
// const Goal = require('../models/goal')();
const Post = require('../models/post')();
const helper = require('../helpers/helper');
const Like = require('./../models/like')();
const User = require('./../models/user')();
const Subscription = require('../models/subscription')();
var moment = require('moment');
var ObjectID = require('mongodb').ObjectID;
let conn;


async function addPost(_, { post }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            if (post.tags && post.tags.length) {
                post.tags = await helper.insertManyIntoTags(post.tags);
            }


            const int = await new Post(post);
            await int.save(post).then(async (p) => {
                console.log(p)

                p.populate('createdBy').populate('tags').execPopulate().then(async populatedPost => {
                    await helper.sendPostCreationEmail(populatedPost);
                    resolve(populatedPost);
                });

            });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
};

async function getPostsByUserIdAndType(_, { userId, status, postType }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Post.find({ 'createdBy': userId, status: status ? status : { $ne: null }, type: postType }).populate('createdBy').populate('tags').exec((err, res) => {

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

async function getPostById(_, { postId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Post.findById(postId)
                .populate({ path: 'usersAttending', select: 'name avatar' })
                .populate('createdBy').populate('tags').exec(async (err, res) => {

                    if (err) {
                        return reject(err)
                    }

                    const likeCount = await Like.count({ referenceId: postId })

                    res['likeCount'] = likeCount;

                    return resolve(res);
                });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function getPostsByType(_, { postType }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Post.find({ status: 'Published', type: postType }).populate('createdBy').populate('tags').exec((err, res) => {

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

async function updatePost(_, { post }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            if (post.tags && post.tags.length) {
                post.tags = await helper.insertManyIntoTags(post.tags);
            }


            await Post.findByIdAndUpdate(post._id, post, { new: true }, (err, res) => {
                if (err) {
                    return reject(err)
                }

                res.populate('createdBy').populate('tags').execPopulate().then((d) => {
                    return resolve(d);
                });
            });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function rsvpEvent(_, { userId, eventId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const sub = await Subscription.findOne({ "metadata.userId": { $eq: ObjectID(userId) } });
            let validSubscription = false;
            let updatedPostWithAttendees;

            if (sub) {
                validSubscription = moment(moment()).isBefore(sub.current_period_end * 1000, "YYYY/MM/DD");
            }

            if (validSubscription) {
                updatedPostWithAttendees = await Post.findOneAndUpdate({ _id: eventId }, { $push: { usersAttending: userId } }, { new: true })
                    .populate({ path: 'usersAttending' }).exec();
            }

            if (updatedPostWithAttendees) {
                return resolve({ usersAttending: updatedPostWithAttendees.usersAttending, validSubscription });
            } else {
                return resolve({ validSubscription })
            }
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function myRSVP(_, { userId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const myRSVPEvents = await Post.find({type: 'event', 'usersAttending': { $in: [userId] } })
                .populate({ path: 'createdBy' }).exec();

            return resolve(myRSVPEvents)

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function deletePost(_, { postId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Post.deleteOne({ _id: postId }, ((err, res) => {

                if (err) {
                    return reject(err)
                }

                return resolve(res.deletedCount);
            })
            );



        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function getAllPosts(_, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            /** Taking Empty Posts array */
            let posts = [];

            /** Fetching all the Published Products */
            const products = await Product.find({ status: 'Published' }).populate('createdBy').populate('tags').exec();

            /** Fetching all the Published Posts */
            posts = await Post.find({ status: 'Published' }).populate('createdBy').populate('tags').exec();
            posts = posts.concat(products);

            // /** Fetching all the Published help-requests and concating it with posts */
            // const helpRequests = await HelpRequest.find({ status: 'Published' }).populate('createdBy').populate('tags').exec();
            // posts = posts.concat(helpRequests);

            // /** Fetching all the Published interviews and concating it with posts */
            // const interviews = await Interview.find({ status: 'Published' }).populate('createdBy').populate('tags').exec();
            // posts = posts.concat(interviews);

            // /** Fetching all the Published requirement and concating it with posts */
            // const requirements = await Requirement.find({ status: 'Published' }).populate('createdBy').populate('tags').exec();
            // posts = posts.concat(requirements);

            // /** Fetching all the Published how-to-doc and concating it with posts */
            // const howtodocs = await Howtodoc.find({ status: 'Published' }).populate('createdBy').populate('tags').exec();
            // posts = posts.concat(howtodocs);

            // /** Fetching all the Published testing and concating it with posts */
            // const testings = await Testing.find({ status: 'Published' }).populate('createdBy').populate('tags').exec();
            // posts = posts.concat(testings);

            // /** Fetching all the Published designs and concating it with posts */
            // const designs = await Design.find({ status: 'Published' }).populate('createdBy').populate('tags').exec();
            // posts = posts.concat(designs);

            // /** Fetching all the Published goals and concating it with posts */
            // const goals = await Goal.find({ status: 'Published' }).populate('createdBy').populate('tags').exec();
            // posts = posts.concat(goals);

            /** Resolving Promise with all the Published posts in the platform */
            return await resolve(posts);




        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}







module.exports = {
    getAllPosts,

    addPost,
    getPostsByUserIdAndType,
    getPostById,
    getPostsByType,
    updatePost,
    deletePost,

    rsvpEvent,
    myRSVP
}