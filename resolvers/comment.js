const connectToMongoDB = require('../helpers/db');
const helper = require('../helpers/helper');
const Comment = require('./../models/comment')();
const Product = require('./../models/product')();
const Post = require('./../models/post')();
const { pubSub } = require('../helpers/pubsub');
const uniq = require('lodash/array').uniq;
const forEach = require('lodash/collection').forEach;
const Like = require('./../models/like')();
var ObjectID = require('mongodb').ObjectID;
let conn;

async function addComment(_, { comment }, { headers, db, decodedToken, context }) {
    return new Promise(async (resolve, reject) => {
        try {

            console.log(context)

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const c = new Comment(comment);
            let commentObj;
            if (c.parentId) {

                const pcForChildren = await Comment.findById(c.parentId).exec();

                await pcForChildren.children.push(c._id);

                await pcForChildren.update({ children: pcForChildren.children });

                await c.save().then(async (com) => {
                    console.log(com);
                    await com.populate('createdBy').populate('children').execPopulate();
                    commentObj = com;
                    // resolve(com);
                })

            } else {
                //  actually insert the parent comment
                c.parents.push(c._id);
                await c.save().then(async (com) => {
                    await com.populate('createdBy').execPopulate();
                    commentObj = com;
                    // resolve(com);
                })
            }
            var data;
            var postLink;

            let usersCommented = await Comment.find({ referenceId: comment.referenceId, status: { $ne: 'Deleted' }, createdBy: { $ne: comment.createdBy } }).select('createdBy').exec();
            let usersLiked = await Like.find({ referenceId: comment.referenceId, userId: { $ne: comment.createdBy } }).select('userId').exec();

            let usersToBeNotified = usersCommented.concat(usersLiked);
            usersToBeNotified = forEach(usersToBeNotified, function (value, key) {
                usersToBeNotified[key] = value.createdBy ? value.createdBy.toString() : value.userId.toString();
            });
            usersToBeNotified = uniq(usersToBeNotified);

            console.log(usersToBeNotified);

            await pubSub.publish('COMMENT_ADDED', commentObj);

            /** Send Email Only if comment type is post */
            if (commentObj.type === 'post' || commentObj.type === 'product') {
                data = await Post.findOne({ _id: commentObj.referenceId }).populate('createdBy').select('createdBy id name type slug description blockId blockSpecificComment').lean().exec();
                await pubSub.publish('LISTEN_NOTIFICATION', { comment: commentObj, usersToBeNotified, post: data })
                postLink = process.env.FRONT_END_URL + `${commentObj.type === 'product' ? 'product' : 'post'}/${data.slug}?type=${data.type}&commentId=${commentObj._id}`;

                const filePathToAuthor = basePath + 'email-template/commentCreateToAuthor';
                const filePathToCommentor = basePath + 'email-template/commentCreateToCommentor';
                const payLoadToAuthor = {
                    NAME: data.createdBy.name,
                    LINK: postLink,
                    COMMENTOR_NAME: commentObj.createdBy.name
                };
                const payLoadToCommentor = {
                    NAME: commentObj.createdBy.name,
                    LINK: postLink
                };
                await helper.sendEmail(data.createdBy.email, filePathToAuthor, payLoadToAuthor);
                await helper.sendEmail(commentObj.createdBy.email, filePathToCommentor, payLoadToCommentor);
            }
            resolve(commentObj);
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}


async function getCommentsByReferenceId(_, { referenceId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }


            let subdiscussion = await Comment.find({ referenceId: referenceId, parentId: null, status: { $ne: 'Deleted' } })
                .populate('createdBy')
                .populate({ path: 'children', match: { status: { $ne: 'Deleted' } }, populate: { path: 'createdBy' } }).exec();
            // subdiscussion = subdiscussion.sort('full_slug')
            console.log(subdiscussion);
            resolve(subdiscussion);


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}



async function getComments(_, { commentId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }


            let subdiscussion = await Comment.find({ _id: commentId, status: { $ne: 'Deleted' } })
                .populate('createdBy')
                .populate({ path: 'children', match: { status: { $ne: 'Deleted' } }, populate: { path: 'children', match: { status: { $ne: 'Deleted' } } } }).exec();
            resolve(subdiscussion);


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function deleteComment(_, { commentId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }


            let c = await Comment.findByIdAndUpdate(commentId, { status: 'Deleted' }).populate('createdBy').exec();

            await pubSub.publish('COMMENT_DELETED', c);
            return resolve(c._id);
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}


async function updateComment(_, { commentId, text }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }


            let c = await Comment.findByIdAndUpdate(commentId, { text: text }, { new: true }).populate('createdBy').exec();

            await pubSub.publish('COMMENT_UPDATED', c);

            return resolve(c);
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

module.exports = {
    addComment,
    getComments,
    getCommentsByReferenceId,
    deleteComment,
    updateComment
}