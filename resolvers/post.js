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
                    await helper.sendPostCreationEmail(populatedPost, populatedPost.type === 'product' ? 'Bugfix' : '');
                    resolve(populatedPost);
                });

            });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

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

async function getAllPosts(_, { pageOptions }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            const sortField = pageOptions.sort && pageOptions.sort.field ? pageOptions.sort.field : 'createdAt';
            let sort = { [sortField]: pageOptions.sort && pageOptions.sort.order ? pageOptions.sort.order : 1 };

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            /** Taking Empty Posts array */
            let posts = [];

            /** Fetching all the Published Posts */
            posts = await Post.find({ status: 'Published' }).populate('createdBy').populate('tags')
                .skip((pageOptions.limit * pageOptions.pageNumber) - pageOptions.limit)
                .limit(pageOptions.limit)
                .sort(sort)
                .exec();

            return await resolve({ posts, total: await Post.estimatedDocumentCount().exec() });




        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function fullSearch(_, { searchString }, { headers, db, decodedToken }) {
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

            /** Fetching all the Posts containing the search string */
            var regex = new RegExp(searchString, 'i');



            posts = await Post.find({

                $or: [
                    {
                        name: { $regex: regex }
                    },
                    {
                        type: { $regex: regex }
                    },
                    {
                        'description.data.text': { $regex: regex }
                    },
                ],



            }).populate('createdBy').populate('tags')
                .exec();
            // posts = await Post.find({ $text: { $search : searchString }}).populate('createdBy').populate('tags')
            // .exec();

            return await resolve(posts);




        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}







module.exports = {
    getAllPosts,
    fullSearch,

    addPost,
    getPostsByUserIdAndType,
    getPostById,
    getPostsByType,
    updatePost,
    deletePost,
}