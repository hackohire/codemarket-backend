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
            let usersLiked = [];
            // await Like.find({ referenceId: comment.referenceId, userId: { $ne: comment.createdBy } }).select('userId').exec();

            let usersToBeNotified = usersCommented.concat(usersLiked);
            usersToBeNotified = forEach(usersToBeNotified, function (value, key) {
                usersToBeNotified[key] = value.createdBy ? value.createdBy.toString() : value.userId.toString();
            });
            usersToBeNotified = uniq(usersToBeNotified);

            // console.log(usersToBeNotified);

            await pubSub.publish('COMMENT_ADDED', commentObj);

            /** Send Email Only if comment type is post */
            if (commentObj.type === 'post') {
                data = await Post.findOne({ _id: commentObj.referenceId }).populate('createdBy').select('createdBy id name type slug description blockId blockSpecificComment').lean().exec();
                let commentNoti = commentObj.toObject();
                commentNoti['referencePost'] = data;
                /** Alert Message Notification */
                await pubSub.publish('LISTEN_NOTIFICATION', { comment: commentNoti, usersToBeNotified })

                /** Don't send if the comment is added by post author */
                if (commentObj.createdBy._id.toString() !== data.createdBy._id.toString()) {
                    const commentType = 'post';
                    postLink = process.env.FRONT_END_URL + `${commentType}/${data.slug}?commentId=${commentObj._id}`;

                    if(commentObj.blockId) {
                        postLink = postLink.concat(`&blockId=${commentObj.blockId}`)
                    }

                    /** Reference to the common email templates foler */
                    const filePathToAuthor = basePath + 'email-template/common-template';
                    const filePathToCommentor = basePath + 'email-template/common-template';

                    /** Creating dynamic varibales such as link, subject and email content */
                    const payLoadToAuthor = {
                        NAME: data.createdBy.name,
                        LINK: postLink,
                        // COMMENTOR_NAME: commentObj.createdBy.name,
                        CONTENT: commentObj.createdBy.name + ' added a comment on your post.',
                        SUBJECT: 'New Comment!'
                    };
                    const payLoadToCommentor = {
                        NAME: commentObj.createdBy.name,
                        LINK: postLink,
                        CONTENT: 'Thank you for commenting. This will add a value to our platform.',
                        SUBJECT: 'Comment Added!'
                    };

                    /** Sending the email */
                    await helper.sendEmail({ to: [data.createdBy.email] }, filePathToAuthor, payLoadToAuthor);
                    await helper.sendEmail({ to: [commentObj.createdBy.email] }, filePathToCommentor, payLoadToCommentor);
                }
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

/** 
 * 1. Fecth all the comments added by anyone, on the posts created by loggedin user 
 * 2. Fetch all the comments that are added as relpy to the loggedin user's comments
*/
async function fetchLatestCommentsForTheUserEngaged(_, { pageOptions, userId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const sortField = pageOptions.sort && pageOptions.sort.field ? pageOptions.sort.field : 'createdAt';
            let sort = { [sortField]: pageOptions.sort && pageOptions.sort.order ? pageOptions.sort.order : -1 };

            let c = await Comment.aggregate([
                { $match: { 
                    status: { $ne: 'Deleted' },
                    /** Uncomment this, when we don't want to show comments added by himself */
                    // createdBy: { $ne: ObjectID(userId) }
                } },
                {
                    /** Fetch the post realted to that comment created by the loggedin user */
                    $lookup: {
                        from: 'posts',
                        as: 'referencePost',
                        let: { status: "$status", reference_id: "$referenceId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $ne: ["$status", "Deleted"] },
                                            { $eq: ["$$reference_id", "$_id"] },
                                        ]
                                    }
                                }
                            },
                        ]
                    }
                },
                {
                    /** Fetch the company realted to that comment created by the loggedin user */
                    $lookup: {
                        from: 'companies',
                        as: 'referenceCompany',
                        let: { status: "$status", reference_id: "$referenceId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $ne: ["$status", "Deleted"] },
                                            { $eq: ["$$reference_id", "$_id"] },
                                        ]
                                    }
                                }
                            },
                        ]
                    }
                },
                {
                    /** Fetch the parent comment realted to that child comment, and check if parent comment is created by the loggedin user */
                    $lookup: {
                        from: 'comments',
                        as: 'parentComment',
                        let: { status: "$status", parentId: "$parentId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $ne: ["$status", "Deleted"] },
                                            { $eq: ["$$parentId", "$_id"] },
                                        ]
                                    }
                                }
                            },
                        ]
                    }
                },
                {
                    $match: {
                        $or: [
                            { 'referencePost.createdBy': ObjectID(userId) },
                            { 'referenceCompany.createdBy': ObjectID(userId) },
                            { 'parentComment.createdBy': ObjectID(userId) }
                        ]
                    }
                },
                {
                    $unwind: { path: '$referencePost', preserveNullAndEmptyArrays: true }
                },
                {
                    $unwind: { path: '$referenceCompany', preserveNullAndEmptyArrays: true }
                },
                {
                    $lookup: {
                        "from": "users",
                        "let": { "created_by": "$createdBy" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$$created_by", "$_id"] } } }
                        ],
                        as: "createdBy"
                    }
                },
                {
                    $unwind: { "path": "$createdBy", "preserveNullAndEmptyArrays": true }
                },

                {
                    $facet: {
                      comments: [
                        { $sort: sort },
                        { $skip: (pageOptions.limit * pageOptions.pageNumber) - pageOptions.limit },
                        { $limit: pageOptions.limit },
                      ],
                      pageInfo: [
                        { $group: { _id: null, count: { $sum: 1 } } },
                      ],
                    },
                  },

            ])
                // .sort(sort)
                // .skip((pageOptions.limit * pageOptions.pageNumber) - pageOptions.limit)
                // .limit(pageOptions.limit)
                .exec()

            return resolve({ messages: c && c.length ? c[0].comments : [], total: c[0].pageInfo[0].count });
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
    updateComment,
    fetchLatestCommentsForTheUserEngaged
}