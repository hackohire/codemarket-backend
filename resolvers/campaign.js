const connectToMongoDB = require('../helpers/db');
var ObjectID = require('mongodb').ObjectID;
let conn;

async function getCampaignsWithTracking(_, { companyId, campaignId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            conn = await connectToMongoDB();

            await conn.collection('stripe_subscriptions').aggregate(db.getCollection('campaign').aggregate([
                {
                    $match: { companies: ObjectID(companyId) }
                },
                {
                    from: 'emails',
                    localField: '_id',
                    foreignField: 'campaignId',
                    as: 'emailData'
                },
                {
                    $project: {
                        _id: { $toString: "$_id" },
                        name: 1,
                        label: 1,
                        descriptionHTML: 1,
                        subject: 1,
                        emailData: 1
                    }
                },
                {
                    $lookup: {
                        from: 'email-tracking',
                        localField: "_id",
                        foreignField: "mail.tags.campaignId",
                        as: 'traking-data'
                    }
                }
            ]));

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

module.exports = {
    getCampaignsWithTracking
}