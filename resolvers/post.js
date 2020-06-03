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
const Unit = require('./../models/purchased_units')();
var ObjectID = require('mongodb').ObjectID;
// const User = require('./../models/user')();
// const Tag = require('./../models/tag')();
// const Subscription = require('../models/subscription')();
// var moment = require('moment');
// var ObjectID = require('mongodb').ObjectID;
const { pubSub } = require('../helpers/pubsub');
const differenceBy = require('lodash/array').differenceBy;
const unionBy = require('lodash/array').unionBy;
const map = require('lodash/collection').map;
const partialRight = require('lodash/function').partialRight;
const pick = require('lodash/object').pick;
var moment = require('moment');
const contactModel = require('../models/contact')();
const uniq = require('lodash/array').uniq;

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

            /** Save the post in the database & send the email notifications */
            await int.save(post).then(async (p) => {
                console.log(p)

                /** User to be notified realtime */
                const usersToBeNotified = uniq(([p.createdBy].concat(p.collaborators).concat(p.clients)).map(i => i.toString()));

                p.populate('createdBy')
                    .populate('tags')
                    .populate('cities')
                    .populate('companies')
                    .populate('jobProfile')
                    .populate('collaborators')
                    .populate('assignees')
                    .populate('clients')
                    .execPopulate().then(async populatedPost => {

                        /** Update the users Realtime */
                        await pubSub.publish('LISTEN_NOTIFICATION', { postUpdated: { post: p }, usersToBeNotified })

                        /** Send email notification to the post creator */
                        await helper.sendPostCreationEmail(populatedPost, populatedPost.type === 'product' ? 'Bugfix' : '');

                        /** Save Activity */
                        await helper.saveActivity('ADD_POST', populatedPost.createdBy._id, null, populatedPost._id, null);

                        /** Send email notification to the collaborators */
                        if (post.status === 'Published' && populatedPost && populatedPost.collaborators && populatedPost.collaborators.length) {
                            const filePath = basePath + 'email-template/common-template';
                            const productLink = `${process.env.FRONT_END_URL}post/${populatedPost.slug}`;
                            populatedPost.collaborators.forEach(async (u) => {
                                const payLoad = {
                                    NAME: u.name,
                                    LINK: productLink,
                                    CONTENT: `You have been added as a collaborator on "${post.name}" by ${populatedPost.createdBy.name}. Please Click here to check the details.`,
                                    SUBJECT: `Collaborator Rights Given`,
                                    HTML_CONTENT: post.descriptionHTML ? `${post.descriptionHTML}` : ``
                                    // TYPE: type ? type : string.capitalize(post.type)
                                };
                                await helper.sendEmail({ to: [u.email] }, filePath, payLoad);
                            })
                            console.log(populatedPost.collaborators);
                        }

                        /** Send email notification to the clients */
                        if (post.status === 'Published' && populatedPost && populatedPost.clients && populatedPost.clients.length) {
                            const filePath = basePath + 'email-template/common-template';
                            const productLink = `${process.env.FRONT_END_URL}post/${populatedPost.slug}`;
                            populatedPost.clients.forEach(async (u) => {
                                const payLoad = {
                                    NAME: u.name,
                                    LINK: productLink,
                                    CONTENT: `You have been added as a client in "${post.name}" by ${populatedPost.createdBy.name}. Please Click here to check the details.`,
                                    SUBJECT: `Client Rights Given`,
                                    HTML_CONTENT: post.descriptionHTML ? `${post.descriptionHTML}` : ``
                                    // TYPE: type ? type : string.capitalize(post.type)
                                };
                                await helper.sendEmail({ to: [u.email] }, filePath, payLoad);
                            })
                        }


                        resolve(populatedPost);
                    });

            });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function getPostsByUserIdAndType(_, { userId, status, postType, pageOptions }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const sortField = pageOptions.sort && pageOptions.sort.field ? pageOptions.sort.field : 'createdAt';
            let sort = { [sortField]: pageOptions.sort && pageOptions.sort.order ? pageOptions.sort.order : 'desc' };

            let condition = { 'createdBy': userId, status: status ? status : { $ne: null }, type: postType }

            let total = await Post.countDocuments(condition).exec()

            const posts = await Post.find(condition)
                .populate('createdBy')
                .populate('tags')
                .populate('companies')
                .populate('cities')
                .populate('users')
                .populate('collaborators')
                .populate('assignees')

                .sort(sort)
                .skip((pageOptions.limit * pageOptions.pageNumber) - pageOptions.limit)
                .limit(pageOptions.limit ? pageOptions.limit : total ? total : 1)
                .exec();

            return resolve({ posts, total });

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
                .populate('companies')
                .populate('cities')
                .populate('createdBy')
                .populate('tags')
                .populate('jobProfile')
                .populate('collaborators')
                .populate('assignees')
                .populate('clients')
                .populate('users')
                .populate('connectedPosts')

                .exec(async (err, res) => {

                    if (err) {
                        return reject(err)
                    }

                    if (res && res.type === 'product') {
                        /** List of users who purchased the bugfix */
                        let usersWhoPurchased = [];

                        /** Find the unitsSold by reference_id stored as productId while purchase and populate userwho purchased */
                        const unitsSold = await Unit.find({ reference_id: postId })
                            .select('purchasedBy createdAt')
                            .populate({ path: 'purchasedBy', select: 'name avatar' })
                            .exec();

                        /** If there is more than 0 units */
                        if (unitsSold && unitsSold.length) {

                            /** Map the array into the fileds "name", "_id", "createdAt" & "avatar" */
                            usersWhoPurchased = unitsSold.map((u) => {
                                let userWhoPurchased = {};
                                userWhoPurchased = u.purchasedBy;
                                userWhoPurchased.createdAt = u.createdAt;
                                return userWhoPurchased;
                            });
                        }

                        /** attach "purchasedBy" with the response */
                        res['purchasedBy'] = usersWhoPurchased;
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

            Post.find({ status: 'Published', type: postType })
                .populate('createdBy')
                .populate('tags')
                .populate('companies')
                .populate('cities')
                .populate('jobProfile')
                .populate('collaborators')
                .populate('assignees')
                .populate('clients')
                // .populate('users')

                .exec((err, res) => {

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

async function updatePostContent(_, { post, updatedBy }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            conn = await connectToMongoDB();

            await Post.findOneAndUpdate({ _id: post._id }, post, { new: true, useFindAndModify: false }, async (err, res) => {
                if (err) {
                    return reject(err)
                }

                await res.populate('createdBy').execPopulate();

                /** Update the users connected with the post realtime */
                const usersToBeNotified = uniq(([res.createdBy._id].concat(res.collaborators).concat(res.clients)).map(i => i.toString()));
                await pubSub.publish('LISTEN_NOTIFICATION', { postUpdated: { post: res }, usersToBeNotified })
                return resolve(res.descriptionHTML);
            });

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function updatePost(_, { post, updatedBy }, { headers, db, decodedToken }) {
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

            const postTemp = await Post.findOne({ _id: post._id });



            await Post.findOneAndUpdate({ _id: post._id }, post, { new: true, useFindAndModify: false }, async (err, res) => {
                if (err) {
                    return reject(err)
                }

                /** Users to be notified realtime */
                const usersToBeNotified = uniq(([res.createdBy].concat(res.collaborators).concat(res.clients)).map(i => i.toString()));

                res
                    .populate('createdBy')
                    .populate('companies')
                    .populate('tags')
                    .populate('cities')
                    .populate('jobProfile')
                    .populate('collaborators')
                    .populate('assignees')
                    .populate('users')
                    .populate('clients')

                    .execPopulate().then(async (d) => {

                        /** Update the users connected with the post realtime */
                        await pubSub.publish('LISTEN_NOTIFICATION', { postUpdated: { post: res }, usersToBeNotified })

                        const allUserAfterPostSave = await helper.getUserAssociatedWithPost(post._id);

                        /** Save Activity */
                        await helper.saveActivity('UPDATE_POST', updatedBy._id, null, post._id, null);

                        /**Send email to author, company owners and  commentators only. Beacuse are sending email to collaborator differently.*/
                        const mergedObjects = unionBy(allUserAfterPostSave[0].author, allUserAfterPostSave[0].collaborators, allUserAfterPostSave[0].commentators, allUserAfterPostSave[0].companyOwners, allUserAfterPostSave[0].clients, 'email');

                        const totalEmails = map(mergedObjects, partialRight(pick, ['email', 'name']));

                        if (totalEmails && totalEmails.length) {
                            const filePath = basePath + 'email-template/common-template';
                            const productLink = `${process.env.FRONT_END_URL}post/${res.slug}`;
                            totalEmails.forEach(async (u) => {
                                const payLoad = {
                                    NAME: u.name,
                                    LINK: productLink,
                                    CONTENT: `The Post "${res.name}" is updated by ${updatedBy.name}. Please check it for latest update`,
                                    SUBJECT: `${updatedBy.name} updated the post "${res.name}"`,
                                    HTML_CONTENT: post.descriptionHTML ? `${post.descriptionHTML}` : ``
                                };

                                await helper.sendEmail({ to: [u.email] }, filePath, payLoad)
                            });
                        }

                        if (res && post.collaborators && post.collaborators.length) {
                            const collaboratorsAfterUpdate = await res.toObject();
                            const collaboratorsBeforeUpdate = (await postTemp.populate('collaborators').execPopulate()).toObject();
                            const collaboratorsToSendEmail = differenceBy(collaboratorsAfterUpdate.collaborators, collaboratorsBeforeUpdate.collaborators, 'email');

                            const collaboratorsIds = collaboratorsToSendEmail.map(u => u._id);

                            console.log(collaboratorsAfterUpdate, "--> ", collaboratorsBeforeUpdate, '-->', collaboratorsIds);
                            if (collaboratorsIds.length > 0) {
                                /** Save Activity */
                                await helper.saveActivity('ADD_COLLABORATOR', updatedBy._id, null, post._id, collaboratorsIds);
                            }

                            const filePath = basePath + 'email-template/common-template';
                            const productLink = `${process.env.FRONT_END_URL}post/${res.slug}`;
                            collaboratorsToSendEmail.forEach(async (u) => {
                                const payLoad = {
                                    NAME: u.name,
                                    LINK: productLink,
                                    CONTENT: `You have been added as a collaborator on "${res.name}" by ${res.createdBy.name}. Please Click here to check the details.`,
                                    SUBJECT: `Collaborator Rights Given on ${res.name}`
                                    // TYPE: type ? type : string.capitalize(post.type)
                                };
                                await helper.sendEmail({ to: [u.email] }, filePath, payLoad);
                            })
                            console.log(collaboratorsToSendEmail);
                        }

                        return resolve(d);
                    });
            });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function deletePost(_, { postId, deletedBy }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const postData = await Post.findOne({ _id: postId }).exec();
            const allUserAfterPostSave = await helper.getUserAssociatedWithPost(postId);
            /**Send email to author, company owners and commentators and collaborators.*/
            const mergedObjects = unionBy(allUserAfterPostSave[0].author, allUserAfterPostSave[0].commentators, allUserAfterPostSave[0].collaborators, allUserAfterPostSave[0].companyOwners, 'email');

            const totalEmails = map(mergedObjects, partialRight(pick, ['email', 'name']));

            if (totalEmails && totalEmails.length) {
                const filePath = basePath + 'email-template/common-template';

                totalEmails.forEach(async (u) => {
                    const payLoad = {
                        NAME: u.name,
                        //  LINK: productLink,
                        CONTENT: `The Post "${postData.name}" is deleted. Please check it for latest update`,
                        SUBJECT: `${deletedBy.name} deleted the post ${postData.name}`
                    };

                    await helper.sendEmail({ to: [u.email] }, filePath, payLoad)
                });
            }

            Post.findOneAndDelete({ _id: postId }, (async (err, res) => {

                if (err) {
                    return reject(err)
                }
                return resolve(res ? 1 : 0);
            })
            );



        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function getAllPosts(_, { pageOptions, type, reference, companyId, connectedWithUser, createdBy, searchString }, { headers }) {
    return new Promise(async (resolve, reject) => {
        try {

            const sortField = pageOptions.sort && pageOptions.sort.field ? pageOptions.sort.field : 'updatedAt';
            let sort = { [sortField]: pageOptions.sort && pageOptions.sort.order ? parseInt(pageOptions.sort.order) : -1 };

            conn = await connectToMongoDB();

            let condition = {
                status: 'Published',
                type: type ? type : { $ne: null },
            }

            if (searchString) {
                if (!condition['$and']) {
                    condition['$and'] = [];
                }
                /** Fetching all the Posts containing the search string */
                var regex = new RegExp(searchString, 'i');

                condition['$and'].push({
                    '$or': [
                        { 'descriptionHTML': { $regex: regex } },
                        { 'name': { $regex: regex } },
                        { 'type': { $regex: regex } },
                        { 'tags.name': { $regex: regex } }
                    ]
                })
            }

            if (connectedWithUser) {
                if (!condition['$and']) {
                    condition['$and'] = [];
                }
                condition['$and'].push({
                    '$or': [
                        { collaborators: ObjectID(connectedWithUser) },
                        { assignees: ObjectID(connectedWithUser) },
                        { createdBy: ObjectID(connectedWithUser) }
                    ]
                })
            }

            if (reference) {
                if (reference.referencePostId && reference.referencePostId.length) {
                    condition['$and'] = [{
                        '$or': [
                            { connectedPosts: reference.referencePostId.map(i => ObjectID(i)), type: reference.postType },
                        ]
                    }]
                }
                if (reference.connectedPosts && reference.connectedPosts.length) {
                    condition['$and'] = [{
                        '$or': [
                            { _id: { $in: reference.connectedPosts.map(i => ObjectID(i)) }, type: reference.postType },
                        ]
                    }]
                }

                if (reference.referencePostId && reference.referencePostId.length && reference.connectedPosts && reference.connectedPosts.length) {
                    condition['$and'] = [{
                        '$or': [
                            { connectedPosts: reference.referencePostId.map(i => ObjectID(i)) },
                            { _id: { $in: reference.connectedPosts.map(i => ObjectID(i)) } }
                        ]
                    }
                    ];
                }
            }

            /** In Company Details Page Fetch Jobs & DreamJob related to that company */
            if (companyId) {
                condition['$and'] = [
                    {
                        '$or': [
                            { company: ObjectID(companyId) },
                            { 'companies': ObjectID(companyId) }
                        ]
                    },
                ]
            }

            /** Taking Empty Posts array */
            let posts = [];
            // let total = await Post.countDocuments(condition).exec()
            posts = await Post.aggregate([
                {
                    $match: condition
                },
                {
                    $lookup: {
                        from: 'likes',
                        localField: '_id',
                        foreignField: 'referenceId',
                        as: 'likes'
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'createdBy',
                        foreignField: '_id',
                        as: 'createdBy'
                    }
                },
                {
                    $lookup: {
                        from: 'companies',
                        localField: 'companies',
                        foreignField: '_id',
                        as: 'companies'
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'collaborators',
                        foreignField: '_id',
                        as: 'collaborators'
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'assignees',
                        foreignField: '_id',
                        as: 'assignees'
                    }
                },
                {
                    $lookup: {
                        from: 'posts',
                        localField: 'connectedPosts',
                        foreignField: '_id',
                        as: 'connectedPosts'
                    }
                },
                {
                    $lookup: {
                        from: 'tags',
                        localField: 'tags',
                        foreignField: '_id',
                        as: 'tags'
                    }
                },
                {
                    $lookup: {
                        from: 'activities',
                        // localField: '_id',
                        // foreignField: 'postId',
                        let: { pId: '$_id' },
                        pipeline: [
                            {
                                $match:
                                {
                                    $expr:
                                    {
                                        $and:
                                            [
                                                { $eq: ["$$pId", "$postId"] }
                                            ]
                                    },
                                    action: { $in: ['ADD_COMMENT', 'UPDATE_POST', 'UPDATE_COMMENT', 'DELETE_COMMENT', 'ADD_COLLABORATOR'] }
                                },
                            },
                            {
                                $lookup:
                                {
                                    from: 'users',
                                    localField: 'by',
                                    foreignField: '_id',
                                    as: 'by'
                                }
                            },
                            {
                                $unwind: {
                                    "path": "$by",
                                    "preserveNullAndEmptyArrays": true
                                }
                            },
                            {
                                $sort: { createdAt: -1 }
                            },
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'collaboratorId',
                                    foreignField: '_id',
                                    as: 'collaboratorId'
                                }
                            },
                            {
                                $addFields: {
                                    collaboratorName: "$collaboratorId.name"
                                }
                            },
                            {
                                $addFields: {
                                    collaboratorName: {
                                        '$reduce': {
                                            'input': '$collaboratorName',
                                            'initialValue': '',
                                            'in': {
                                                '$concat': [
                                                    '$$value',
                                                    { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                                    '$$this']
                                            }
                                        }
                                    }
                                }

                            },
                            {
                                $project: {
                                    _id: 1,
                                    action: 1,
                                    by: 1,
                                    commentId: 1,
                                    postId: 1,
                                    activityDate: 1,
                                    collaboratorId: 1,
                                    collaboratorName: 1,
                                    message: {
                                        $switch:
                                        {
                                            branches: [
                                                {
                                                    case: { $eq: ["$action", "UPDATE_POST"] },
                                                    then: { $concat: ["$by.name", " has updated this post"] }
                                                },
                                                {
                                                    case: { $eq: ["$action", "ADD_COMMENT"] },
                                                    then: { $concat: ["$by.name", " has added comment in this post"] }
                                                },
                                                {
                                                    case: { $eq: ["$action", "UPDATE_COMMENT"] },
                                                    then: { $concat: ["$by.name", " has updated comment in this post"] }
                                                },
                                                {
                                                    case: { $eq: ["$action", "DELETE_COMMENT"] },
                                                    then: { $concat: ["$by.name", " has deleted comment in this post"] }
                                                },
                                                {
                                                    case: { $eq: ["$action", "DELETE_POST"] },
                                                    then: { $concat: ["$by.name", " has deleted this post"] }
                                                },
                                                // {
                                                //     case: { $eq: ["$action", "ADD_COLLABORATOR"]},
                                                //     then: { $concat: ["$by.name", " has added collaborator in this post."]}
                                                // },
                                                {
                                                    case: { $eq: ["$action", "ADD_COLLABORATOR"] },
                                                    then: { $concat: ["$by.name", " has added ", "$collaboratorName", " as a collaborators in this post"] }
                                                },
                                            ],
                                            default: null
                                        }
                                    }
                                }

                            }
                        ],
                        as: 'activities'
                    }
                },
                {
                    $project: {
                        name: 1,
                        type: 1,
                        description: 1,
                        descriptionHTML: 1,
                        slug: 1,
                        createdBy: { $arrayElemAt: ['$createdBy', 0] },
                        tags: 1,
                        likeCount: { $size: '$likes' },
                        // comments: '$comments',
                        // commentCount: { $size: '$comments'},
                        createdAt: 1,
                        updatedAt: 1,
                        companies: 1,
                        connectedPosts: 1,
                        collaborators: 1,
                        assignees: 1,
                        email: 1,
                        phone: 1,
                        activities: 1
                    }
                },
                {
                    $facet: {
                        posts: [
                            { $sort: sort },
                            { $skip: (pageOptions.limit * pageOptions.pageNumber) - pageOptions.limit },
                            { $limit: pageOptions.limit },
                        ],
                        pageInfo: [
                            { $group: { _id: null, count: { $sum: 1 } } },
                        ],
                    },
                },

            ]).collation({ locale: 'en' })
                // .sort(sort)
                // .skip((pageOptions.limit * pageOptions.pageNumber) - pageOptions.limit)
                // .limit(pageOptions.limit ? pageOptions.limit : total ? total : 1)
                .exec();


            return await resolve(
                {
                    posts: posts && posts.length ? posts[0].posts : [],
                    total: posts && posts.length && posts[0].pageInfo && posts[0].pageInfo.length ? posts[0].pageInfo[0].count : 0
                });

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
                conn = db;
                console.log('Using existing mongoose connection.');
            }

            /** Taking Empty Posts array */
            let posts = [];

            /** Fetching all the Posts containing the search string */
            var regex = new RegExp(searchString, 'i');

            posts = await Post.aggregate([
                {
                    $lookup:
                    {
                        from: 'tags',
                        localField: 'tags',
                        foreignField: '_id',
                        as: 'tags'
                    }
                },
                { $match: { $or: [{ name: { $regex: regex } }, { "descriptionHTML": { $regex: regex } }, { type: { $regex: regex } }, { "tags.name": { $regex: regex } }] } },

            ]).exec();

            return await resolve(posts);




        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function getCountOfAllPost(_, { userId, companyId, reference }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            let condition = {
                status: "Published"
            };

            if (userId) {
                condition['$or'] = [
                    { collaborators: ObjectID(userId) },
                    { assignees: ObjectID(userId) },
                    { createdBy: ObjectID(userId) }
                ]
            }

            if (companyId) {
                condition['$or'] = [
                    { companies: ObjectID(companyId) }
                ]
            };

            if (reference) {
                if (reference.referencePostId && reference.referencePostId.length) {
                    condition['$and'] = [{
                        '$or': [
                            { connectedPosts: reference.referencePostId.map(i => ObjectID(i)) },
                        ]
                    }]
                }
                if (reference.connectedPosts && reference.connectedPosts.length) {
                    condition['$and'] = [{
                        '$or': [
                            { _id: { $in: reference.connectedPosts.map(i => ObjectID(i)) } },
                        ]
                    }]
                }
                if (reference.referencePostId && reference.referencePostId.length && reference.connectedPosts && reference.connectedPosts.length) {
                    condition['$and'] = [{
                        '$or': [
                            { connectedPosts: reference.referencePostId.map(i => ObjectID(i)) },
                            { _id: { $in: reference.connectedPosts.map(i => ObjectID(i)) } }
                        ]
                    }
                    ];
                }
            }

            const result = await Post.aggregate([
                {
                    $match: condition
                },
                {
                    $group:
                    {
                        _id: "$type",
                        count: { $sum: 1 }
                    }
                }
            ]).exec();

            const fileCout = await Post.aggregate([
                {
                    $match:
                    {
                        "description.data.createdBy": ObjectID(userId),
                        "description.type": "attaches"
                    }
                },
                {
                    $project:
                    {
                        blocks:
                        {
                            $filter:
                            {
                                input: "$description",
                                as: "block",
                                cond: { $and: [{ $eq: ["$$block.type", "attaches"] }, { $eq: ["$$block.data.createdBy", ObjectID(userId)] }] }
                            }
                        }
                    }
                },
                {
                    $unwind:
                    {
                        path: "$blocks",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group:
                    {
                        _id: "$blocks.data.createdBy",
                        count: { $sum: 1 }
                    }
                },
            ]);

            result.push({ _id: 'files', count: fileCout.length ? fileCout[0].count : 0 });
            return await resolve(result);

        } catch (err) {
            console.log(err);
            return reject(err);
        }
    });
}

async function getEmailPhoneCountForContact(_, { type }, { header, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }


            const result = await Post.aggregate([
                {
                    $match: { type: type }
                },
                {
                    $project:
                    {
                        type: 1,
                        emailData:
                        {
                            $filter:
                            {
                                input: "$email",
                                as: "e",
                                cond: { $ne: ["$$e", ""] }
                            }
                        },
                        phoneData:
                        {
                            $filter:
                            {
                                input: "$phone",
                                as: "p",
                                cond: { $ne: ["$$p", ""] }
                            }
                        }
                    }
                },
                {
                    $group:
                    {
                        _id: "$type",
                        emailData:
                        {
                            $push:
                            {
                                $cond: [
                                    { $and: [{ $gt: [{ $size: "$emailData" }, 0] }] },
                                    "$_id",
                                    0
                                ]
                            }

                        },
                        phoneData:
                        {
                            $push:
                            {
                                $cond: [
                                    { $and: [{ $gt: [{ $size: "$phoneData" }, 0] }] },
                                    "$_id",
                                    0
                                ]
                            }

                        }
                    }
                },
                {
                    $project:
                    {
                        _id: 1,
                        emailCount:
                        {
                            $size:
                            {
                                $filter:
                                {
                                    input: "$emailData",
                                    as: "ed",
                                    cond: { $ne: ["$$ed", 0] }
                                }
                            }
                        },
                        phoneCount:
                        {
                            $size:
                            {
                                $filter:
                                {
                                    input: "$phoneData",
                                    as: "pd",
                                    cond: { $ne: ["$$pd", 0] }
                                }
                            }
                        }
                    }
                }
            ]).exec();

            return await resolve(result);
        } catch (err) {
            console.log(err);
            return reject(err);
        }
    });
}

async function saveContact(_, { }, { header, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {
            const { contacts } = require('./contacts');
            console.log(contacts[0]);
            const contactData = new contactModel(contacts[0]);
            await contactData.save();
            console.log(contactData);
            resolve(true);
        } catch (err) {
            console.log(err);
            reject(false);
        }
    })
}

async function getPostByPostType(_, { postType, userId, pageOptions }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }
            const sortField = pageOptions.sort && pageOptions.sort.field ? pageOptions.sort.field : 'createdAt';
            let sort = { [sortField]: pageOptions.sort && pageOptions.sort.order ? pageOptions.sort.order : 'desc' };
            let condition = { type: postType }
            if (userId) {
                condition.createdBy = userId;
            }
            let total = await Post.countDocuments(condition).exec()
            const posts = await Post.find(condition)
                .populate('createdBy')
                .sort(sort)
                .skip((pageOptions.limit * pageOptions.pageNumber) - pageOptions.limit)
                .limit(pageOptions.limit ? pageOptions.limit : total ? total : 1)
                .exec();
            return resolve({ posts, total });
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

module.exports = {
    getAllPosts,
    fullSearch,
    getEmailPhoneCountForContact,
    addPost,
    getPostsByUserIdAndType,
    getPostById,
    getPostsByType,
    updatePost,
    deletePost,
    updatePostContent,
    getCountOfAllPost,
    saveContact,
    getPostByPostType,
}