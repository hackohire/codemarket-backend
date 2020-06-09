const connectToMongoDB = require('../helpers/db');
var ObjectID = require('mongodb').ObjectID;
const Emails = require('../models/email')();
const Contact = require('../models/contact')();
const File = require('../models/file')();
const Batch = require('../models/batch')();
const Campaign = require('../models/campaign')();
const EmailValidator = require('email-deep-validator');
const emailValidator = new EmailValidator();
const AWS = require('aws-sdk');
const sqs = new AWS.SQS({
    region: "us-east-1",
});

let conn;

async function getCampaignsWithTracking(_, { pageOptions, companyId, batchId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            conn = await connectToMongoDB();

            let campaigns = await conn.collection('campaigns').aggregate([
                {
                    $match: { companies: ObjectID(companyId), batchId: ObjectID(batchId) }
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
                        batchId: 1,
                        from: 1,
                        subject: 1,
                        emailData: { $slice: ['$emailData', (pageOptions.pageNumber - 1) * pageOptions.limit, pageOptions.limit]},
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

async function getCsvFileData(_, {data, createdBy, fileName, label, companies}, { headers, db, decodedToken }) {
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

        //Create campaign
        const campaignObj = {
            name: label + ' Campaign',
            createdBy: createdBy,
            companies: [{ _id: companies._id }]
        };
        const campaignData = new Campaign(campaignObj);
        const cResult = await campaignData.save();
        
        // Create Batch
        const batchObj = {
            name: label,
            createdBy: createdBy,
            campaignId: cResult._id
        };
        const batchData = new Batch(batchObj);
        await batchData.save();

        // const fileData = new File(fileObj);
        // const fileResult = await fileData.save();

        // const queueUrl = "https://sqs.us-east-1.amazonaws.com/784380094623/validateEmailProd";

        async function run(data, index) {
            return new Promise((resolve1, reject) => {
                if (index < data.length) {
                    data[index]["createdBy"] = createdBy;
                    data[index]["batch"] = label;
                    // if (index === (data.length - 1)) {
                    //     data[index]["fileId"] = fileResult._id.toString();
                    // }

                    // const params = {
                    //     MessageBody: JSON.stringify(data[index]),
                    //     QueueUrl: queueUrl,
                    // };
                    
                    // sqs.sendMessage(params, (error, res) => {
                    //     if (error) {
                    //         console.log("Error while sending ==> ", error);
                    //     } else {
                    //         console.log("Success while sending ==> ", res);
                    //     }
                    //     index += 1;
                    //     run(data, index);
                    // });
                } else {
                    console.log("this is done")
                    return resolve(true);
                }
            })
        }
        run(data, 0)
    })
}

async function getEmailData(_, { batches, emailTemplate, subject, createdBy, from, companyId }, { headers, db, decodedToken }) {
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
                    firstName: 1,
                    lastName: 1,
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
                                cond: { $eq: ["$$e.status", "Ok"]}
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

        const campaignData = await Campaign.find({ batchId: batches._id });
        const pattern =  /{([^}]+)}/g;
        const vartoReplaceInTemplate = emailTemplate.match(pattern);
        const vartoReplaceInFrom = from.match(pattern);
        const vartoReplaceInSubject = subject.match(pattern);
        
        const queueUrl = `https://sqs.us-east-1.amazonaws.com/784380094623/${process.env.SEND_EMAIL_QUEUE}`;

        if (!emailTemplate) {
            return reject(false);
        }

        // Update Campaign
        const updatedBatch = await Campaign.update({ _id: campaignData[0]._id},{ $set: { subject: subject, descriptionHTML: emailTemplate, from: from} });


        if (result.length) {
            async function sendEmail(data, index) {
                if (index < data.length) {
                    let tempEmailTemplate = emailTemplate.slice();
                    let tempSubjectName = subject.slice();
                    let tempFrom = from.slice();
                    // Change variables in template
                    if (vartoReplaceInTemplate && vartoReplaceInTemplate.length) {
                        vartoReplaceInTemplate.forEach((v) => {
                            switch(v){
                                case "{companyName}":
                                    tempEmailTemplate = tempEmailTemplate.replace(v, data[index].companyName);
                                    break;
                                case "{name}":
                                    tempEmailTemplate = tempEmailTemplate.replace(v, data[index].name);
                                    break;
                                case "{cityName}":
                                    tempEmailTemplate = tempEmailTemplate.replace(v, data[index].cityName);
                                    break;
                                case "{firstName}":
                                    tempEmailTemplate = tempEmailTemplate.replace(v, data[index].firstName);
                                    break;
                                case "{lastName}":
                                    tempEmailTemplate = tempEmailTemplate.replace(v, data[index].lastName);
                                    break;
                                case "{organizationName}":
                                    tempEmailTemplate = tempEmailTemplate.replace(v, data[index].OrganizatinName);
                                    break;
                                case "{proposalName}":
                                    tempEmailTemplate = tempEmailTemplate.replace(v, data[index].proposalName);
                                    break;
                                case "{instaProfileId}":
                                    tempEmailTemplate = tempEmailTemplate.replace(v, data[index].instaProfileId);
                                    break;
                                case "{followers}":
                                    tempEmailTemplate = tempEmailTemplate.replace(v, data[index].followers);
                                    break;
                                case "{following}":
                                    tempEmailTemplate = tempEmailTemplate.replace(v, data[index].following);
                                    break;
                                case "{followers}":
                                    tempEmailTemplate = tempEmailTemplate.replace(v, data[index].followers);
                                    break;
                                case "{url}":
                                    tempEmailTemplate = tempEmailTemplate.replace(v, data[index].url);
                                    break;
                                default:
                                    break;
                            }
                        })
                    }

                    // Change variables in Subject
                    if (vartoReplaceInSubject && vartoReplaceInSubject.length) {
                        vartoReplaceInSubject.forEach((v) => {
                            switch(v){
                                case "{companyName}":
                                    tempSubjectName = tempSubjectName.replace(v, data[index].companyName);
                                    break;
                                case "{name}":
                                    tempSubjectName = tempSubjectName.replace(v, data[index].name);
                                    break;
                                case "{cityName}":
                                    tempSubjectName = tempSubjectName.replace(v, data[index].cityName);
                                    break;
                                case "{firstName}":
                                    tempSubjectName = tempSubjectName.replace(v, data[index].firstName);
                                    break;
                                case "{lastName}":
                                    tempSubjectName = tempSubjectName.replace(v, data[index].lastName);
                                    break;
                                case "{organizationName}":
                                    tempSubjectName = tempSubjectName.replace(v, data[index].OrganizatinName);
                                    break;
                                case "{proposalName}":
                                    tempSubjectName = tempSubjectName.replace(v, data[index].proposalName);
                                    break;
                                case "{instaProfileId}":
                                    tempSubjectName = tempSubjectName.replace(v, data[index].instaProfileId);
                                    break;
                                case "{followers}":
                                    tempSubjectName = tempSubjectName.replace(v, data[index].followers);
                                    break;
                                case "{following}":
                                    tempSubjectName = tempSubjectName.replace(v, data[index].following);
                                    break;
                                case "{followers}":
                                    tempSubjectName = tempSubjectName.replace(v, data[index].followers);
                                    break;
                                case "{url}":
                                    tempSubjectName = tempSubjectName.replace(v, data[index].url);
                                    break;
                                default:
                                    break;
                            }
                        })
                    }
                    
                    // Change variables in FROM
                    if (vartoReplaceInFrom && vartoReplaceInFrom.length) {
                        vartoReplaceInFrom.forEach((v) => {
                            switch(v){
                                case "{companyName}":
                                    tempFrom = tempFrom.replace(v, data[index].companyName);
                                    break;
                                case "{name}":
                                    tempFrom = tempFrom.replace(v, data[index].name);
                                    break;
                                case "{cityName}":
                                    tempFrom = tempFrom.replace(v, data[index].cityName);
                                    break;
                                case "{firstName}":
                                    tempFrom = tempFrom.replace(v, data[index].firstName);
                                    break;
                                case "{lastName}":
                                    tempFrom = tempFrom.replace(v, data[index].lastName);
                                    break;
                                case "{organizationName}":
                                    tempFrom = tempFrom.replace(v, data[index].OrganizatinName);
                                    break;
                                case "{proposalName}":
                                    tempFrom = tempFrom.replace(v, data[index].proposalName);
                                    break;
                                case "{instaProfileId}":
                                    tempFrom = tempFrom.replace(v, data[index].instaProfileId);
                                    break;
                                case "{followers}":
                                    tempFrom = tempFrom.replace(v, data[index].followers);
                                    break;
                                case "{following}":
                                    tempFrom = tempFrom.replace(v, data[index].following);
                                    break;
                                case "{followers}":
                                    tempFrom = tempFrom.replace(v, data[index].followers);
                                    break;
                                case "{url}":
                                    tempFrom = tempFrom.replace(v, data[index].url);
                                    break;
                                default:
                                    break;
                            }
                        })
                    }

                    const uuid = new ObjectID().toHexString();

                    // Create Mail Obj
                    const mailOption = {
                        headers: {
                            'X-SES-CONFIGURATION-SET': 'la2050',
                            'X-SES-MESSAGE-TAGS': `campaignId=${campaignData[0]._id}, uuid=${uuid}`
                        },
                        from: `${tempFrom} <${process.env.FROM_EMAIL}>`,
                        to: [data[index].email[0].email],
                        replyTo: "info@codemarket.io",
                        type: "email",
                        status: "Published",
                        subject: tempSubjectName,
                        html: tempEmailTemplate,
                        batchId: batches._id,
                        campaignId: campaignData[0]._id,
                        createdBy: createdBy,
                        companies: [{ _id: companyId }],
                        uuid: uuid
                    };
                    // const hiddenElement = `<p style="display: none;"> {campaignId:${campaignData[0]._id}}</p>`;
                    // const batchElement = `<p style="display: none;"> {batchId:${batches._id}}</p>`;
                    // const toEmailElement = `<p style="display: none;"> {toEmail:${data[index].email[0].email}}</p>`;
                    // mailOption.html = "<html><body>" + mailOption.html + hiddenElement + batchElement + toEmailElement + "</body></html>";
                    const hiddenUUID = `<p style="display: none;"> {uuid:${uuid}}</p>`;
                    mailOption.html = "<html><body>" + mailOption.html + hiddenUUID +"</body></html>";
                    const params = {
                        MessageBody: JSON.stringify(mailOption),
                        QueueUrl: queueUrl,
                    };

                    console.log(index , mailOption);
                    sqs.sendMessage(params,async (error, res) => {
                        if (error) {
                            console.log("Error while sending ==> ", error);
                        } else {
                            console.log("Success while sending ==> ", res);
                        }
                        // const result = await Contact.updateOne({ _id: data[index]._id },{ isEmailSent: true });
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

async function saveCsvFileData(_, {data, createdBy, fileName, label, companyId}, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {
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
    
            // Create Batch
            const batchObj = {
                name: label,
                createdBy: createdBy,
                companyId: companyId
            };
            
            const batchData = new Batch(batchObj);
            await batchData.save();

            //Create campaign
            const campaignObj = {
                name: label + ' Campaign',
                createdBy: createdBy,
                companies: [{ _id: companyId }],
                batchId: batchData._id
            };
            const campaignData = new Campaign(campaignObj);
            const cResult = await campaignData.save();
            
    
            // const fileData = new File(fileObj);
            // const fileResult = await fileData.save();
    
            async function run(data, index) {
                return new Promise((resolve1, reject) => {
                    if (index < data.length) {
                        data[index]["createdBy"] = createdBy;
                        data[index]["batch"] = label;
                        // if (index === (data.length - 1)) {
                        //     data[index]["fileId"] = fileResult._id.toString();
                        // }
                        data[index]["email"] = [{
                            email: data[index]["email"],
                            status: data[index]["status"],
                        }];
    
                        data[index]["status"] = "Published";
                        data[index]["batchId"] = batchData._id;
                        data[index]["campaignId"] = campaignData._id;

                        console.log("Data  ==> ", data[index]);
                        const cData = new Contact(data[index]);
                        cData.save().then((res) => {
                            index += 1;
                            run(data, index);
                        }).
                        catch((err) => {
                            console.log("Err ", err);
                        })
                    } else {
                        console.log("this is done")
                        return resolve({ batchId: batchData._id});
                    }
                })
            }
            run(data, 0)
        } catch (err) {
            console.log("TC error ==> ", err);
        }
    })
}

async function getMailingList(_, { companyId }, {headers, db, decodedToken}) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const result = await Batch.find({companyId: companyId}).populate('createdBy').exec();
            resolve(result);
        } catch (err) {
            console.log("GetMailing List error ==> ", err);
            reject(false);
        }
    });
}

async function getMailingListContacts(_, {pageOptions, batchId }, {headers, db, decodedToken}) {
    return new Promise(async (resolve, reject) => {

        const sortField = pageOptions.sort && pageOptions.sort.field ? pageOptions.sort.field === 'status' ? 'email.status': pageOptions.sort.field : 'updatedAt';
        let sort = { [sortField]: pageOptions.sort && pageOptions.sort.order ? parseInt(pageOptions.sort.order) : -1 };

        conn = await connectToMongoDB();

        const result = await Contact.aggregate([
            {
                $match: {batchId: ObjectID(batchId)}
            },
            {
                $facet: {
                    contacts: [
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
                contacts: result && result.length ? result[0].contacts : [],
                total: result && result.length && result[0].pageInfo && result[0].pageInfo.length ? result[0].pageInfo[0].count : 0
            });

    });
}

async function getCampaignData(_, {pageOptions, companyId }, {headers, db, decodedToken}) {
    return new Promise(async (resolve, reject) => {
        try {

            conn = await connectToMongoDB();

            const sortField = pageOptions.sort && pageOptions.sort.field ? pageOptions.sort.field : 'updatedAt';
            let sort = { [sortField]: pageOptions.sort && pageOptions.sort.order ? parseInt(pageOptions.sort.order) : -1 };
            const result = await Campaign.aggregate([
                {
                    $match: { companies: ObjectID(companyId)}
                },
                {
                    $facet: {
                        campaigns: [
                            { $sort: sort },
                            { $skip: (pageOptions.limit * pageOptions.pageNumber) - pageOptions.limit },
                            { $limit: pageOptions.limit },
                        ],
                        pageInfo: [
                            { $group: { _id: null, count: { $sum: 1 } } },
                        ],
                    },
                },
            ]);

            return await resolve(
                {
                    campaigns: result && result.length ? result[0].campaigns : [],
                    total: result && result.length && result[0].pageInfo && result[0].pageInfo.length ? result[0].pageInfo[0].count : 0
                });

        } catch (err) {
            console.log("This is error in catch ==> ", err);
            resolve(err);
        }
    });
}

module.exports = {
    getCampaignsWithTracking,
    getCampaignEmails,
    getCsvFileData,
    getEmailData,
    saveCsvFileData,
    getMailingList,
    getMailingListContacts,
    getCampaignData
}