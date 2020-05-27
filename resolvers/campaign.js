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

        data.forEach((d) => {
            const params = {
                MessageBody: JSON.stringify(d),
                QueueUrl: queueUrl,
            };

            sqs.sendMessage(params, (error, data) => {
                if (error) {
                    console.log("Error while sending ==> ", error);
                } else {
                    console.log("Success while sending ==> ", data);
                }
            });
        })
        resolve(true);
        
    })
}

async function getEmailData(_, { batches, emailTemplate, subject }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {

        if (!db) {
            console.log('Creating new mongoose connection.');
            conn = await connectToMongoDB();
        } else {
            console.log('Using existing mongoose connection.');
        }

        const filePathToOtherUsers = basePath + 'email-template/empty';
        const result = await Contact.aggregate([
            {
                $match: {
                    batch: batches.name        
                }
            },
            {
                $project: {
                    companyName: 1,
                    cityName: 1,
                    name: 1,
                    OrganizatinName : 1,
                    proposalName: 1,
                    instaProfileId: 1,
                    followers: 1,
                    following: 1,
                    email: {
                         $filter: {
                                input: "$email",
                                as: "e",
                                cond: { $eq: ["$$e.status", true]}
                            }
                    }
                }
               
            },
            {
                $match: {
                    email: { $gt: {$size : 0}}
                },
            }
        ]).exec();

        console.log("B ==> ", result);

        const pattern =  /{([^}]+)}/g;
        const vartoReplace = emailTemplate.match(pattern);
        
        const queueUrl = "https://sqs.us-east-1.amazonaws.com/784380094623/sendEmail";

        if (result.length) {
            result.forEach(async (eData) => {
                let tempEmailTemplate = emailTemplate.slice();
                let tempSubjectName = subject.slice();
    
                if (vartoReplace && vartoReplace.length) {
                    vartoReplace.forEach((v) => {
                        switch(v){
                            case "{companyName}":
                                tempEmailTemplate = tempEmailTemplate.replace(v, eData.companyName);
                                tempSubjectName = tempSubjectName.replace(v, eData.companyName);
                                break;
                            case "{name}":
                                tempEmailTemplate = tempEmailTemplate.replace(v, eData.name);
                                tempSubjectName = tempSubjectName.replace(v, eData.name);
                                break;
                            case "{cityName}":
                                tempEmailTemplate = tempEmailTemplate.replace(v, eData.cityName);
                                tempSubjectName = tempSubjectName.replace(v, eData.cityName);
                                break;
                            case "{cityName}":
                                tempEmailTemplate = tempEmailTemplate.replace(v, eData.cityName);
                                tempSubjectName = tempSubjectName.replace(v, eData.cityName);
                                break;
                            case "{organizationName}":
                                tempEmailTemplate = tempEmailTemplate.replace(v, eData.OrganizatinName);
                                tempSubjectName = tempSubjectName.replace(v, eData.OrganizatinName);
                                break;
                            case "{proposalName}":
                                tempEmailTemplate = tempEmailTemplate.replace(v, eData.proposalName);
                                tempSubjectName = tempSubjectName.replace(v, eData.proposalName);
                                break;
                            case "{instaProfileId}":
                                tempEmailTemplate = tempEmailTemplate.replace(v, eData.instaProfileId);
                                tempSubjectName = tempSubjectName.replace(v, eData.instaProfileId);
                                break;
                            case "{followers}":
                                tempEmailTemplate = tempEmailTemplate.replace(v, eData.followers);
                                tempSubjectName = tempSubjectName.replace(v, eData.followers);
                                break;
                            case "{following}":
                                tempEmailTemplate = tempEmailTemplate.replace(v, eData.following);
                                tempSubjectName = tempSubjectName.replace(v, eData.following);
                                break;
                            case "{followers}":
                                tempEmailTemplate = tempEmailTemplate.replace(v, eData.followers);
                                tempSubjectName = tempSubjectName.replace(v, eData.followers);
                                break;
                            case "{url}":
                                tempEmailTemplate = tempEmailTemplate.replace(v, eData.url);
                                tempSubjectName = tempSubjectName.replace(v, eData.url);
                                break;
                            default:
                                break;
                        }
                    })
    
                }
                const mailOption = {
                    // headers: {
                    //     'X-SES-CONFIGURATION-SET': 'campaign',
                    //     'X-SES-MESSAGE-TAGS': 'campaignId=5e8db413194f75696c162682'
                    // },
                    from: process.env.FROM_EMAIL,
                    to: eData.email[0].email,
                    replyTo: "info@codemarket.io",
                    subject: tempSubjectName,
                    html: tempEmailTemplate,
                }
    
                const params = {
                    MessageBody: JSON.stringify(mailOption),
                    QueueUrl: queueUrl,
                };
    
                sqs.sendMessage(params, (error, data) => {
                    if (error) {
                        console.log("Error while sending ==> ", error);
                    } else {
                        console.log("Success while sending ==> ", data);
                    }
                });
    
                console.log("C ==> ", mailOption);
            })
        }
        resolve(true);
    });
}

module.exports = {
    getCampaignsWithTracking,
    getCampaignEmails,
    getCsvFileData,
    getEmailData
}