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

                p.populate('createdBy')
                    .populate('tags')
                    .populate('cities')
                    .populate('companies')
                    .populate('jobProfile')
                    .populate('collaborators')
                    .populate('assignees')

                    .execPopulate().then(async populatedPost => {

                        /** Send email notification to the post creator */
                        await helper.sendPostCreationEmail(populatedPost, populatedPost.type === 'product' ? 'Bugfix' : '');

                        /** Send email notification to the collaborators */
                        if(post.status === 'Published' && populatedPost && populatedPost.collaborators && populatedPost.collaborators.length) {      
                            const filePath = basePath + 'email-template/common-template';
                            const productLink = `${process.env.FRONT_END_URL}post/${populatedPost.slug}`;
                            populatedPost.collaborators.forEach(async (u) => {
                                const payLoad = {
                                    NAME: u.name,
                                    LINK: productLink,
                                    CONTENT: `You have been added as a collaborator on "${post.name}" by ${post.createdBy.name}. Please Click here to check the details.`,
                                    SUBJECT: `Collaborator Rights Given`
                                    // TYPE: type ? type : string.capitalize(post.type)
                                };
                                await helper.sendEmail({to: [u.email]}, filePath, payLoad);
                            })
                            console.log( populatedPost.collaborators);
                        }

                        /** Send email notification to the assignee */
                        if(post.status === 'Published' && populatedPost && populatedPost.assignees && populatedPost.assignees.length) {       
                            const filePath = basePath + 'email-template/common-template';
                            const productLink = `${process.env.FRONT_END_URL}post/${populatedPost.slug}`;
                            populatedPost.assignees.forEach(async (u) => {
                                const payLoad = {
                                    NAME: u.name,
                                    LINK: productLink,
                                    CONTENT: `An assignment "${post.name}" has been assigned to you by ${post.createdBy.name}. Please Click here to check the details.`,
                                    SUBJECT: `New Assignment assigned to you`
                                    // TYPE: type ? type : string.capitalize(post.type)
                                };
                                await helper.sendEmail({to: [u.email]}, filePath, payLoad);
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

            const postTemp = await Post.findOne({_id: post._id});

            await Post.findOneAndUpdate({ _id: post._id }, post, { new: true, useFindAndModify: false }, async (err, res) => {
                if (err) {
                    return reject(err)
                }

                res
                    .populate('createdBy')
                    .populate('companies')
                    .populate('tags')
                    .populate('cities')
                    .populate('jobProfile')
                    .populate('collaborators')
                    .populate('assignees')
                    .populate('users')

                    .execPopulate().then(async (d) => {

                        const allUserAfterPostSave = await helper.getUserAssociatedWithPost(post._id);

                        /**Send email to author, company owners and  commentators only. Beacuse are sending email to collaborator differently.*/
                        const mergedObjects = unionBy(allUserAfterPostSave[0].author, allUserAfterPostSave[0].commentators, allUserAfterPostSave[0].companyOwners, 'email');
                        
                        const totalEmails = map(mergedObjects, partialRight(pick, ['email', 'name']));

                        if (totalEmails && totalEmails.length) {
                            const filePath = basePath + 'email-template/common-template';
                            const productLink = `${process.env.FRONT_END_URL}post/${res.slug}`;
                            totalEmails.forEach(async (u) => {
                                const payLoad = {
                                    NAME: u.name,
                                    LINK: productLink,
                                    CONTENT: `The Post "${res.name}" is updated. Please check it for latest update`,
                                    SUBJECT: `Post Upated!`
                                };

                                await helper.sendEmail({to: [u.email]}, filePath, payLoad)
                            });
                        }

                        if(res && post.collaborators && post.collaborators.length) {
                            const collaboratorsAfterUpdate = await res.toObject();
                            const collaboratorsBeforeUpdate = (await postTemp.populate('collaborators').execPopulate()).toObject();
                            const collaboratorsToSendEmail = differenceBy(collaboratorsAfterUpdate.collaborators, collaboratorsBeforeUpdate.collaborators, 'email');
        
                            const filePath = basePath + 'email-template/common-template';
                            const productLink = `${process.env.FRONT_END_URL}post/${res.slug}`;
                            collaboratorsToSendEmail.forEach(async (u) => {
                                const payLoad = {
                                    NAME: u.name,
                                    LINK: productLink,
                                    CONTENT: `You have been added as a collaborator on "${res.name}" by ${res.createdBy.name}. Please Click here to check the details.`,
                                    SUBJECT: `Collaborator Rights Given`
                                    // TYPE: type ? type : string.capitalize(post.type)
                                };
                                await helper.sendEmail({to: [u.email]}, filePath, payLoad);
                            })
                            console.log(collaboratorsToSendEmail);
                        }

                        if(res && post.assignees && post.assignees.length) {
                            const assigneesAfterUpdate = await res.toObject();
                            const assigneesBeforeUpdate = (await postTemp.populate('assignees').execPopulate()).toObject();
                            const assiggneesToSendEmail = differenceBy(assigneesAfterUpdate.assignees, assigneesBeforeUpdate.assignees, 'email');
        
                            const filePath = basePath + 'email-template/common-template';
                            const productLink = `${process.env.FRONT_END_URL}post/${res.slug}`;
                            assiggneesToSendEmail.forEach(async (u) => {
                                const payLoad = {
                                    NAME: u.name,
                                    LINK: productLink,
                                    CONTENT: `A "${res.type} ${res.name}" has been assigned to you by ${res.createdBy.name}. Please Click here to check the details.`,
                                    SUBJECT: `New Assignment assigned to you`
                                    // TYPE: type ? type : string.capitalize(post.type)
                                };
                                await helper.sendEmail({to: [u.email]}, filePath, payLoad);
                            })
                            console.log(assiggneesToSendEmail);
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



async function deletePost(_, { postId }, { headers, db, decodedToken }) {
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
                         SUBJECT: `Post Deleted!`
                     };

                     await helper.sendEmail({to: [u.email]}, filePath, payLoad)
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

async function getAllPosts(_, { pageOptions, type, reference, companyId, connectedWithUser, createdBy }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            const sortField = pageOptions.sort && pageOptions.sort.field ? pageOptions.sort.field : 'createdAt';
            let sort = { [sortField]: pageOptions.sort && pageOptions.sort.order ? pageOptions.sort.order : -1 };

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            let condition = {
                status: 'Published',
                type: type ? type : { $ne: null }
            }

            if(createdBy) {
                condition['$and'] = [{
                    '$or': [
                        { createdBy: ObjectID(createdBy) }
                    ]
                }]
            }

            if (connectedWithUser) {
                condition['$and'] = [{
                    '$or': [
                        { collaborators: ObjectID(connectedWithUser) },
                        { assignees: ObjectID(connectedWithUser) },
                        { createdBy: ObjectID(connectedWithUser) }
                    ]
                }]
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
                            { _id: {$in : reference.connectedPosts.map(i => ObjectID(i))}, type: reference.postType },
                        ]
                    }]
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
                /** The below commented code is to fetch the comments related to the posts */
                // {
                //     $lookup: {
                //         from: 'comments',
                //         let: { status: "$status", reference_id: "$_id" },
                //         pipeline: [
                //             {
                //                 $match:
                //                 {
                //                     $expr:
                //                     {
                //                         $and:
                //                             [
                //                                 { $ne: ["$status", "Deleted"] },
                //                                 { $eq: ["$$reference_id", "$referenceId"] },
                //                                 { $eq: ["$parentId", null] }
                //                             ]
                //                     }
                //                 }
                //             },
                //             {
                //                 $lookup: {
                //                     "from": "users",
                //                     "let": { "created_by": "$createdBy" },
                //                     pipeline: [
                //                         { $match: { $expr: { $eq: ["$$created_by", "$_id"] } } }
                //                     ],
                //                     as: "createdBy"
                //                 }
                //             },
                //             {
                //                 $unwind: {
                //                     "path": "$createdBy",
                //                     "preserveNullAndEmptyArrays": true
                //                 }
                //             },
                //         ],
                //         as: 'comments'
                //     }
                // },
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
                    $project: {
                        name: 1,
                        type: 1,
                        description: 1,
                        slug: 1,
                        createdBy: { $arrayElemAt: ['$createdBy', 0] },
                        tags: 1,
                        likeCount: { $size: '$likes' },
                        comments: '$comments',
                        createdAt: 1,
                        companies: 1,
                        connectedPosts: 1,
                        collaborators: 1,
                        assignees: 1
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

            ])
                // .sort(sort)
                // .skip((pageOptions.limit * pageOptions.pageNumber) - pageOptions.limit)
                // .limit(pageOptions.limit ? pageOptions.limit : total ? total : 1)
                .exec();

            /** Fetching all the Published Posts */
            // posts = await Post.find({ 
            //     status: 'Published'
            // }).populate('createdBy').populate('tags')
            //     .skip((pageOptions.limit * pageOptions.pageNumber) - pageOptions.limit)
            //     .limit(pageOptions.limit)
            //     .sort(sort)
            //     .exec();

            return await resolve(
                { 
                    posts: posts && posts.length ? posts[0].posts : [],
                    total: posts && posts.length && posts[0].pageInfo ? posts[0].pageInfo[0].count : 0
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
                { $match: { $or: [{ name: { $regex: regex } }, { "description.data.text": { $regex: regex } }, { type: { $regex: regex } }, { "tags.name": { $regex: regex } }] } },
                //  {$lookup: {

                //  }}

            ]).exec();

            // posts = await Post.find({

            //     $or: [
            //         {
            //             name: { $regex: regex }
            //         },
            //         {
            //             type: { $regex: regex }
            //         },
            //         {
            //             'description.data.text': { $regex: regex }
            //         },
            //     ],

            // }).populate('createdBy').populate('tags').exec();
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