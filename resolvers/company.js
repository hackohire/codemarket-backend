const connectToMongoDB = require('../helpers/db');
const Company = require('../models/company')();
const Post = require('../models/post')();
const helper = require('../helpers/helper');
const Like = require('./../models/like')();
var array = require('lodash/array');
const { pubSub } = require('../helpers/pubsub');
var ObjectID = require('mongodb').ObjectID;
let conn;

async function addCompany(_, { company }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const int = await new Company(company);

            const checkIfExists = await Company.find({ $text: { $search: company.name } }).populate('createdBy').populate('cities').exec();

            if (checkIfExists.length) {
                console.log(checkIfExists);
                throw new Error('AlreadyExists');
            } else {
                await int.save(company).then(async (p) => {
                    console.log(p)

                    p.populate('createdBy').populate('cities').execPopulate().then(async populatedCompany => {
                        // await helper.sendCompanyCreationEmail(populatedCompany, populatedCompany.type === 'product' ? 'Bugfix' : '');
                        resolve(populatedCompany);
                    });

                });
            }
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function updateCompany(_, { company, operation }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            let updatedCompany;

            if (operation && operation.operation) {
                let mongooseOperationDoc = {};

                /** Switch Case to check if operation is related to company posts */
                switch (operation.operation) {
                    case 'ADD':
                        mongooseOperationDoc = {
                            $push: {
                                posts: {
                                    $each: [operation.post],
                                    $position: 0
                                }
                            }
                        };
                        updatedCompany = await Company.findByIdAndUpdate(company._id, mongooseOperationDoc, { new: true }).populate('createdBy cities').exec();
                        break;
                    case 'DELETE':
                        mongooseOperationDoc = {
                            $pull: {
                                posts: {
                                    _id: operation['post']._id
                                }
                            }
                        };
                        updatedCompany = await Company.findByIdAndUpdate(company._id, mongooseOperationDoc, { new: true }).populate('createdBy cities').exec();
                        break;

                    case 'UPDATE': {
                        mongooseOperationDoc = {
                            $set: {
                                [`posts.$[elem].description`]: operation['post'].description
                            }
                        };
                        const arrayFilters = [
                            {
                                'elem._id': operation['post']._id
                            }
                        ];
                        updatedCompany = await Company.findByIdAndUpdate(company._id, mongooseOperationDoc, { arrayFilters, new: true }).populate('createdBy cities').exec();
                        break;
                    }
                }

                /** After updating company fetch company data again for comments */
                updatedCompany = await Company.aggregate([
                    { $match: { _id: ObjectID(company._id) } },
                    { $unwind: { "path": "$posts", "preserveNullAndEmptyArrays": true } },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'posts.createdBy',
                            foreignField: '_id',
                            as: "postCreatedBy"
                        }
                    },
                    {
                        $unwind: {
                            "path": "$postCreatedBy",
                            "preserveNullAndEmptyArrays": true
                        }
                    },
                    {
                        $lookup: {
                            from: 'comments',
                            let: { status: "$status", post_id: "$posts._id" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $ne: ["$status", "Deleted"] },
                                                { $eq: ["$referenceId", ObjectID(company._id)] },
                                                { $eq: ["$parentId", null] },
                                                { $eq: ["$$post_id", "$postId"] }
                                            ]
                                        }
                                    },
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
                        $group: {
                            _id: "$_id",
                            status: { $first: "$status" },
                            description: { $first: "$description" },
                            slug: { $first: "$slug" },
                            cover: { $first: "$cover" },
                            cities: { $first: "$cities" },
                            howCanYouHelp: { $first: "$howCanYouHelp" },
                            name: { $first: "$name" },
                            title: { $first: "$title" },
                            type: { $first: "$type" },
                            createdBy: { $first: "$createdBy" },
                            likes: { $first: "$likes" },
                            tags: { $first: "$tags" },
                            posts: {
                                $push:
                                {
                                    _id: "$posts._id",
                                    challengeType: "$posts.challengeType",
                                    goalType: "$posts.goalType",
                                    postType: "$posts.postType",
                                    description: "$posts.description",
                                    createdBy: "$postCreatedBy",
                                    comments: "$comments",
                                    createdAt: "$posts.createdAt",
                                    updatedAt: "$posts.updatedAt",
                                }
                            },
                            location: { $first: "$location" },
                            createdAt: { $first: "$createdAt" },
                            updatedAt: { $first: "$updatedAt" },
                        }
                    },
                    {
                        $project: {
                            name: 1,
                            type: 1,
                            description: 1,
                            slug: 1,
                            cities: 1,
                            createdBy: { $arrayElemAt: ['$createdBy', 0] },
                            likeCount: { $size: '$likes' },
                            tags: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            location: 1,
                            posts: 1,
                            cover: 1,
                            questions: 1,
                            ideas: 1,
                            status: 1,
                        }
                    }
                ]);
                updatedCompany = updatedCompany[0];
            } else {
                const checkIfExists = await Company.find({ $text: { $search: company.name } }).populate('createdBy').populate('cities').exec();

                if (checkIfExists.length && checkIfExists[0].id !== company._id) {
                    console.log(checkIfExists);
                    throw new Error('AlreadyExists');
                } else {
                    updatedCompany = await Company.findByIdAndUpdate(company._id, company, { new: true }).populate('createdBy cities').exec();
                }
            }
            await pubSub.publish('COMPANY_UPDATED', updatedCompany);
            return resolve(updatedCompany);

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function getCompaniesByUserIdAndType(_, { userId, companyType }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Company.find({ 'createdBy': userId, type: companyType ? companyType : { $ne: null } }).populate('createdBy').populate('cities').exec((err, res) => {

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

async function getCompanyById(_, { companyId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const company = await Company.aggregate([
                { $match: { _id: ObjectID(companyId) } },
                { $unwind: { "path": "$posts", "preserveNullAndEmptyArrays": true } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'posts.createdBy',
                        foreignField: '_id',
                        as: "postCreatedBy"
                    }
                },
                {
                    $unwind: {
                        "path": "$postCreatedBy",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $lookup: {
                        from: 'comments',
                        let: { status: "$status", post_id: "$posts._id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $ne: ["$status", "Deleted"] },
                                            { $eq: ["$referenceId", ObjectID(companyId)] },
                                            { $eq: ["$parentId", null] },
                                            { $eq: ["$$post_id", "$postId"] }
                                        ]
                                    }
                                },
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
                    $group: {
                        _id: "$_id",
                        status: { $first: "$status" },
                        description: { $first: "$description" },
                        slug: { $first: "$slug" },
                        cover: { $first: "$cover" },
                        cities: { $first: "$cities" },
                        howCanYouHelp: { $first: "$howCanYouHelp" },
                        name: { $first: "$name" },
                        title: { $first: "$title" },
                        type: { $first: "$type" },
                        createdBy: { $first: "$createdBy" },
                        likes: { $first: "$likes" },
                        tags: { $first: "$tags" },
                        posts: {
                            $push:
                            {
                                _id: "$posts._id",
                                challengeType: "$posts.challengeType",
                                goalType: "$posts.goalType",
                                postType: "$posts.postType",
                                default: "$posts.default",
                                description: "$posts.description",
                                createdBy: "$postCreatedBy",
                                comments: "$comments",
                                createdAt: "$posts.createdAt",
                                updatedAt: "$posts.updatedAt",
                            }
                        },
                        location: { $first: "$location" },
                        createdAt: { $first: "$createdAt" },
                        updatedAt: { $first: "$updatedAt" },
                    }
                },
                {
                    $project: {
                        name: 1,
                        type: 1,
                        description: 1,
                        slug: 1,
                        cities: 1,
                        createdBy: { $arrayElemAt: ['$createdBy', 0] },
                        likeCount: { $size: '$likes' },
                        tags: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        location: 1,
                        posts: 1,
                        cover: 1,
                        questions: 1,
                        ideas: 1,
                        status: 1,
                    }
                }
            ])

            return resolve(company[0]);
            // Company.findById(companyId).populate('createdBy').populate('cities').exec(async (err, res) => {

            //     if (err) {
            //         return reject(err)
            //     }

            //     const likeCount = await Like.count({ referenceId: companyId })

            //     res['likeCount'] = likeCount;

            //     return resolve(res);
            // });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function getCompaniesByType(_, { companyType }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Company.find({ type: companyType ? companyType : { $regex: /^$|\w/ }}).populate('createdBy').populate('cities').exec((err, res) => {

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



async function deleteCompany(_, { companyId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Company.deleteOne({ _id: companyId }, ((err, res) => {

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

/** Lambda to fetch the events for company details page */
async function getEventsByCompanyId(_, { companyId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            let events = await Post.find({ type: 'event', company: companyId }).populate('createdBy').exec();

            return resolve(events);

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

/** This Lambda Function is to fetch the list of users, who has selected the company while creating the dreamjob */

async function getListOfUsersInACompany(_, { companyId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            let users = await Post.find({ type: 'dream-job', company: companyId }).populate('createdBy').exec();

            users = users && users.length ? users.map(u => u.createdBy) : [];
            users = array.uniqBy(users, 'id')

            return resolve(users);


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}








module.exports = {

    addCompany,
    updateCompany,

    getCompaniesByUserIdAndType,
    getCompanyById,
    getCompaniesByType,
    deleteCompany,
    getListOfUsersInACompany,
    getEventsByCompanyId
}