const connectToMongoDB = require('../helpers/db');
var ObjectID = require('mongodb').ObjectID;
const Emails = require('../models/email')();
const Contact = require('../models/contact')();
const File = require('../models/file')();
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

async function getCsvFileData(_, {data, createdBy, fileName}, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {

        if (!db) {
            console.log('Creating new mongoose connection.');
            conn = await connectToMongoDB();
        } else {
            console.log('Using existing mongoose connection.');
        }

        const fileObj = {
            name: fileName,
            createdBy
        };

        // const fileData = new File(fileObj);
        // const fileResult = await fileData.save();

        const queueUrl = "https://sqs.us-east-1.amazonaws.com/784380094623/validateEmail";

        async function run(data, index) {
            return new Promise((resolve1, reject) => {
                if (index < data.length) {
                    data[index]["createdBy"] = createdBy;

                    // if (index === (data.length - 1)) {
                    //     data[index]["fileId"] = fileResult._id.toString();
                    // }

                    const params = {
                        MessageBody: JSON.stringify(data[index]),
                        QueueUrl: queueUrl,
                    };
        
                    sqs.sendMessage(params, (error, res) => {
                        if (error) {
                            console.log("Error while sending ==> ", error);
                        } else {
                            console.log("Success while sending ==> ", res);
                        }
                        index += 1;
                        run(data, index);
                    });
                } else {
                    console.log("this is done")
                    return resolve(true);
                }
            })
        }
        run(data, 0)
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

        if (!emailTemplate) {
            return reject(false);
        }

        if (result.length) {
            async function sendEmail(data, index) {
                if (index < data.length) {
                    let tempEmailTemplate = emailTemplate.slice();
                    let tempSubjectName = subject.slice();
                    if (vartoReplace && vartoReplace.length) {
                        vartoReplace.forEach((v) => {
                            switch(v){
                                case "{companyName}":
                                    tempEmailTemplate = tempEmailTemplate.replace(v, data[index].companyName);
                                    tempSubjectName = tempSubjectName.replace(v, data[index].companyName);
                                    break;
                                case "{name}":
                                    tempEmailTemplate = tempEmailTemplate.replace(v, data[index].name);
                                    tempSubjectName = tempSubjectName.replace(v, data[index].name);
                                    break;
                                case "{cityName}":
                                    tempEmailTemplate = tempEmailTemplate.replace(v, data[index].cityName);
                                    tempSubjectName = tempSubjectName.replace(v, data[index].cityName);
                                    break;
                                case "{cityName}":
                                    tempEmailTemplate = tempEmailTemplate.replace(v, data[index].cityName);
                                    tempSubjectName = tempSubjectName.replace(v, data[index].cityName);
                                    break;
                                case "{organizationName}":
                                    tempEmailTemplate = tempEmailTemplate.replace(v, data[index].OrganizatinName);
                                    tempSubjectName = tempSubjectName.replace(v, data[index].OrganizatinName);
                                    break;
                                case "{proposalName}":
                                    tempEmailTemplate = tempEmailTemplate.replace(v, data[index].proposalName);
                                    tempSubjectName = tempSubjectName.replace(v, data[index].proposalName);
                                    break;
                                case "{instaProfileId}":
                                    tempEmailTemplate = tempEmailTemplate.replace(v, data[index].instaProfileId);
                                    tempSubjectName = tempSubjectName.replace(v, data[index].instaProfileId);
                                    break;
                                case "{followers}":
                                    tempEmailTemplate = tempEmailTemplate.replace(v, data[index].followers);
                                    tempSubjectName = tempSubjectName.replace(v, data[index].followers);
                                    break;
                                case "{following}":
                                    tempEmailTemplate = tempEmailTemplate.replace(v, data[index].following);
                                    tempSubjectName = tempSubjectName.replace(v, data[index].following);
                                    break;
                                case "{followers}":
                                    tempEmailTemplate = tempEmailTemplate.replace(v, data[index].followers);
                                    tempSubjectName = tempSubjectName.replace(v, data[index].followers);
                                    break;
                                case "{url}":
                                    tempEmailTemplate = tempEmailTemplate.replace(v, data[index].url);
                                    tempSubjectName = tempSubjectName.replace(v, data[index].url);
                                    break;
                                default:
                                    break;
                            }
                        })
                    }

                    // Create Mail Obj
                    const mailOption = {
                        headers: {
                            'X-SES-CONFIGURATION-SET': 'la2050',
                            'X-SES-MESSAGE-TAGS': `campaignId=${batches.campaignId}`
                        },
                        from: process.env.FROM_EMAIL,
                        to: [data[index].email[0].email],
                        replyTo: "info@codemarket.io",
                        type: "email",
                        status: "Published",
                        subject: tempSubjectName,
                        html: tempEmailTemplate,
                        campaignId: batches.campaignId,
                        companies: [{ _id: '5db1c84ec10c45224c4b95fd' }],
                    };

                    const params = {
                        MessageBody: JSON.stringify(mailOption),
                        QueueUrl: queueUrl,
                    };


                    sqs.sendMessage(params, (error, res) => {
                        if (error) {
                            console.log("Error while sending ==> ", error);
                        } else {
                            console.log("Success while sending ==> ", res);
                        }
                        index += 1;
                        sendEmail(data, index);
                    });

                } else {
                    console.log("This is DONE!!!")
                    return resolve(true);
                }
            }

            sendEmail(result, 0);
        } else {
            return reject({message: "No emails found for this campaign!"});
        }
    });
}

module.exports = {
    getCampaignsWithTracking,
    getCampaignEmails,
    getCsvFileData,
    getEmailData
}