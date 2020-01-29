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

                p.populate('createdBy')
                    .populate('tags')
                    .populate('cities')
                    .populate('company')
                    .populate('companies')
                    .populate('jobProfile')
                    .populate('businessGoals')
                    .populate('businessChallenges')
                    .populate('businessAreas')
                    .populate('sellProducts.products')
                    .populate('sellServices.services')
                    .populate('fundingBy')
                    .populate('fundingTo')
                    .populate("fundingProcess")
                    .execPopulate().then(async populatedPost => {
                        if(populatedPost && populatedPost.isPostUnderCompany) {
                            await pubSub.publish('COMPANY_POST_CHANGES', {postAdded: populatedPost});
                        }
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
                .populate('company')
                .populate('companies')
                .populate('cities')
                .populate('fundingBy')
                .populate('fundingTo')
                .populate("fundingProcess")
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
                .populate('company')
                .populate('companies')
                .populate('cities')
                .populate('createdBy')
                .populate('tags')
                .populate('jobProfile')
                .populate('businessGoals')
                .populate('businessChallenges')
                .populate('businessAreas')
                .populate('sellProducts.products')
                .populate('sellServices.services')
                .populate('fundingBy')
                .populate('fundingTo')
.populate("fundingProcess")
                .exec(async (err, res) => {

                    if (err) {
                        return reject(err)
                    }

                    if (res.type === 'product') {
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
                .populate('company')
                .populate('companies')
                .populate('cities')
                .populate('jobProfile')
                .populate('businessGoals')
                .populate('businessChallenges')
                .populate('businessAreas')
                .populate('sellProducts.products')
                .populate('sellServices.services')
                .populate('fundingBy')
                .populate('fundingTo')
                .populate("fundingProcess")
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

        
            await Post.findOneAndUpdate({ _id: post._id }, post, { new: true, useFindAndModify: false }, (err, res) => {
                if (err) {
                    return reject(err)
                }

                res
                    .populate('createdBy')
                    .populate('company')
                    .populate('companies')
                    .populate('tags')
                    .populate('cities')
                    .populate('jobProfile')
                    .populate('businessGoals')
                    .populate('businessChallenges')
                    .populate('businessAreas')
                    .populate('sellProducts.products')
                    .populate('sellServices.services')
                    .populate('fundingBy')
                    .populate('fundingTo')
                    .populate("fundingProcess")
                    .execPopulate().then(async (d) => {

                        if(d && d.isPostUnderCompany) {
                            await pubSub.publish('COMPANY_POST_CHANGES', {postUpdated: d});
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

            Post.findOneAndDelete({ _id: postId }, (async (err, res) => {

                if (err) {
                    return reject(err)
                }
                if(res && res.isPostUnderCompany) {
                    await pubSub.publish('COMPANY_POST_CHANGES', {postDeleted: res});
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

async function getAllPosts(_, { pageOptions, type, referencePostId, companyId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            const sortField = pageOptions.sort && pageOptions.sort.field ? pageOptions.sort.field : 'createdAt';
            let sort = { [sortField]: pageOptions.sort && pageOptions.sort.order ? pageOptions.sort.order : 'desc' };

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

            if (referencePostId) {
                condition['$and'] = [{
                    '$or': [
                        { referencePostId: ObjectID(referencePostId) },
                    ]
                }]
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
                    {
                        '$or': [
                            { type: 'job'},
                            { type: 'dream-job' },
                            { type: 'sales-challenge' },
                            { type: 'marketing-challenge' },
                            { type: 'technical-challenge' },
                            { type: 'business-challenge' },
                            { type: 'team-challenge' },
                            { type: 'sales-goal' },
                            { type: 'marketing-goal' },
                            { type: 'technical-goal' },
                            { type: 'team-goal' },
                            { type: 'business-goal' },
                            { type: 'mission' },
                            { type: 'company-post'}
                        ]
                    }
                ]
            }

            /** Taking Empty Posts array */
            let posts = [];
            let total = await Post.countDocuments(condition).exec()
            posts = await Post.aggregate([
                {
                    $match: condition
                },
                {
                    $lookup: {
                        from: 'comments',
                        // localField: '_id',
                        // foreignField: 'referenceId',
                        let: { status: "$status", reference_id: "$_id" },
                        pipeline: [
                            {
                                $match:
                                {
                                    $expr:
                                    {
                                        $and:
                                            [
                                                { $ne: ["$status", "Deleted"] },
                                                { $eq: ["$$reference_id", "$referenceId"] },
                                                { $eq: ["$parentId", null] }
                                            ]
                                    }
                                }
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
                                $unwind: {
                                    "path": "$createdBy",
                                    "preserveNullAndEmptyArrays": true
                                }
                            },
                        ],
                        as: 'comments'
                    }
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
                        company: 1
                    }
                }

            ])
                .sort(sort)
                .skip((pageOptions.limit * pageOptions.pageNumber) - pageOptions.limit)
                .limit(pageOptions.limit ? pageOptions.limit : total ? total : 1)
                .exec();

            /** Fetching all the Published Posts */
            // posts = await Post.find({ 
            //     status: 'Published'
            // }).populate('createdBy').populate('tags')
            //     .skip((pageOptions.limit * pageOptions.pageNumber) - pageOptions.limit)
            //     .limit(pageOptions.limit)
            //     .sort(sort)
            //     .exec();

            return await resolve({ posts, total });

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