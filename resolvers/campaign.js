const connectToMongoDB = require('../helpers/db');
var ObjectID = require('mongodb').ObjectID;
const Emails = require('../models/email')();
const Contact = require('../models/contact')();
const EmailValidator = require('email-deep-validator');
const emailValidator = new EmailValidator();
const AWS = require('aws-sdk');
const sqs = new AWS.SQS({
    region: "us-east-1",
});

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

async function getCsvFileData(_, {data}, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {

        if (!db) {
            console.log('Creating new mongoose connection.');
            conn = await connectToMongoDB();
        } else {
            console.log('Using existing mongoose connection.');
        }

        const queueUrl = "https://sqs.us-east-1.amazonaws.com/784380094623/validateEmail";

        // data.forEach((d) => {
            const params = {
                MessageBody: JSON.stringify({"hi": "hello"}),
                QueueUrl: queueUrl,
            };

            sqs.sendMessage(params, (error, data) => {
                if (error) {
                    console.log("Error while sending ==> ", error);
                } else {
                    console.log("Success while sending ==> ", data);
                }
            });
        // })
        // async function validEmail(emails) {
        //     return new Promise((resolve, reject) => {
        //         var emailObj = [];
        //         async function run1(data, index) {
        //             if (index < data.length) {
        //                     emailValidator.verify(data[index]).then(async (res) => {
        //                         if (res.wellFormed && res.validDomain) {
        //                             console.log("true email ==> ", data[index]);
        //                             emailObj.push({email: data[index], status: true});
        //                         } else {
        //                             console.log("false email ==> ", data[index]);
        //                             emailObj.push({email: data[index], status: false});
        //                         }
        //                         index += 1;
        //                         await run1(data, index);
        //                     })
        //                     .catch(async (err) => {
        //                         emailObj.push({email: data[index], status: true});
        //                         index += 1;
        //                         await run1(data, index);
        //                     });
        //             } else {
        //                 resolve(emailObj);
        //             }
        //         }
        //         run1(emails, 0)
        //     })
        // }
    
        // async function run(data, index) {
        //     if (index < data.length) {
        //         console.log("CURRENT" ,index);
        //         validEmail(data[index].email).then(async (e) => {
        //             data[index].email = e;
                    
                    
        //             const result = new Contact(data[index]);
        //             console.log(result);
                    
        //             result.save().then(async () => {
        //                 index += 1;
        //                 await run(data, index);
        //             })
        //             // console.log("Resutl ==> ", data[index]);
        //         }).catch(err => {
        //             console.log("ee", index, err);
        //         });
        //         // data.email = result;
        //     } else {
        //         console.log("Over and out !!!");
        //         resolve(true);
        //     }
        // }
        // run(data, 0)
    })
}

module.exports = {
    getCampaignsWithTracking,
    getCampaignEmails,
    getCsvFileData
}