const connectToMongoDB = require('../helpers/db');
var ObjectID = require('mongodb').ObjectID;
const Emails = require('../models/email')();
let conn;

async function getCampaignsWithTracking(_, { pageOptions, companyId, campaignId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            conn = await connectToMongoDB();

            const campaigns = await conn.collection('campaigns').aggregate([
                {
                    $match: { companies: ObjectID(companyId) }
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
                        from: 'emails',
                        localField: '_id',
                        foreignField: 'campaignId',
                        as: 'emailData'
                    }
                },
                {
                    $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true  }
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        label: 1,
                        descriptionHTML: 1,
                        companies: 1,
                        createdBy: 1,
                        subject: 1,
                        emailData: { $slice: ['$emailData', 0, 10]},
                        count: { $size: "$emailData"}
                    }
                },
                // {
                //     $lookup: {
                //         from: 'email-tracking',
                //         localField: "_id",
                //         foreignField: "mail.tags.campaignId",
                //         as: 'traking-data'
                //     }
                // }
            ]).toArray();

            return resolve(campaigns);

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function getCampaignEmails(_, { pageOptions, campaignId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {


            const sortField = pageOptions.sort && pageOptions.sort.field ? pageOptions.sort.field : 'updatedAt';
            let sort = { [sortField]: pageOptions.sort && pageOptions.sort.order ? parseInt(pageOptions.sort.order) : -1 };

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const emails = await Emails.aggregate([
                {
                    $match: { campaignId: ObjectID(campaignId)}
                },
                {
                    $facet: {
                        emails: [
                            { $sort: sort },
                            { $skip: (pageOptions.limit * pageOptions.pageNumber) - pageOptions.limit },
                            { $limit: pageOptions.limit },
                        ],
                        pageInfo: [
                            { $group: { _id: null, count: { $sum: 1 } } },
                        ],
                    },
                },
            ]).exec();

            return await resolve(
                {
                    emails: emails && emails.length ? emails[0].emails : [],
                    total: emails && emails.length && emails[0].pageInfo ? emails[0].pageInfo[0].count : 0
                });

        } catch (err) {
            console.log(err)
            resolve(err);
        }
    });
}

module.exports = {
    getCampaignsWithTracking,
    getCampaignEmails
}