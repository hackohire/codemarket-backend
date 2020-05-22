const nodemailer = require('nodemailer');
var auth = require('./auth');
const Tag = require('../models/tag')();
const City = require('../models/city')();
const Post = require('../models/post')();
var ObjectId = require('mongodb').ObjectID;
const Unit = require('../models/purchased_units')();
const { EmailTemplate } = require('email-templates-v2');
var string = require('lodash/string');


async function checkIfUserIsAdmin(decodedToken) {
    const isUserAdmin = new Promise((resolve, reject) => {
        decodedToken.then((res, err) => {
            // console.log(res);
            if (err) reject(err);
            if (res && res['cognito:groups'] && res['cognito:groups'].length) {
                // console.log(res['cognito:groups'].indexOf('Admin'))
                resolve(res['cognito:groups'].indexOf('Admin') > -1);
            }
        });
    });
    return isUserAdmin;
}

// This method adds the tag only without Id, and then returns the array of ID of added tags with the id of tags we get from argument
async function insertManyIntoTags(tags) {
    console.log(tags);
    const tagsWithIds = tags.filter(p => p._id).map(p => p._id);
    const tagsWithoutIds = tags.filter(p => !p._id);

    const tagsAdded = new Promise((resolve, reject) => {
        Tag.insertMany(tagsWithoutIds, { ordered: false, rawResult: true }).then((d) => {
            console.log(d)
            const addedTags = d && d.ops && d.ops.length ? d.ops.map(id => id._id) : []
            const returnTags = addedTags.concat(tagsWithIds);
            resolve(returnTags.length ? returnTags : []);
        });
    })
    return tagsAdded;
}

// This method adds the cities only without Id, and then returns the array of ID of added cities with the id of tags we get from argument
async function insertManyIntoCities(cities) {
    console.log(cities);
    const citiesWithIds = cities.filter(p => p._id).map(p => p._id);
    const citiesWithoutIds = cities.filter(p => !p._id);

    const citiesAdded = new Promise((resolve, reject) => {
        City.insertMany(citiesWithoutIds, { ordered: false, rawResult: true }).then((d) => {
            console.log(d)
            const addedCities = d && d.ops && d.ops.length ? d.ops.map(id => id._id) : []
            const returnCities = addedCities.concat(citiesWithIds);
            resolve(returnCities.length ? returnCities : []);
        });
    })
    return citiesAdded;
}

async function sendEmailWithStaticContent(event, context) {
    return new Promise(async (resolve, reject) => {
        try {
            /** parse body */
            let body;
            try {
                body = JSON.parse(event.body);
            } catch (e) {
                body = {};
            }

            const emailSent = await sendEmail(body.email, basePath + 'email-template/bni-event-template', body, 'sumi@codemarket.io');
            return resolve({
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true,
                },
                body: JSON.stringify({ emailSent, email: body.email })
            });
        }
        catch (e) {
            console.log(e);
            return reject(e);
        }
    });

    // let conn = await connectToMongoDB();
    // conn.collection('emails').findOneAndUpdate({email: body.email}, {$set: });

}

async function sendEmail(toEmail, filePath, body, city, fromEmail = '') {
    return new Promise(async (resolve, reject) => {
        try {

            if (!process.env.IS_OFFLINE || true) {
                const transporter = await nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: process.env.SMTP_PORT,
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASSWORD
                    },
                    debug: true,
                    secure: true
                });
                const template = new EmailTemplate(filePath);
                await template.render(body, async (err, result) => {
                    console.log('Error HTML Email Template Rendering', err)
                    const { html, subject } = result;
                    const mailOptions = {
                        headers: {
                            'X-SES-CONFIGURATION-SET': 'la2050',
                            'X-SES-MESSAGE-TAGS': 'campaignId=5eb95a652b638810be5ee0f3' // Therapist
                        },
                        from: '"Therapy Therapist" <sumi@codemarket.io>', // Therapy
                        to: toEmail,
                        // cc: "mysumifoods@gmail.com",
                        bcc: ['mysumifoods@gmail.com'],
                        replyTo: fromEmail ? fromEmail : process.env.FROM_EMAIL,
                        subject: subject,
                        html: html,
                    };
                    await transporter.sendMail(mailOptions, (error, response) => {
                        if (error) {
                            console.log('Mail Sending Error', error);
                            resolve(false);
                        } else {
                            console.log('Mail Sent Successfully', response);
                            resolve(true);
                        }
                    });
                });
            } else {
                resolve(true);
            }

        } catch (err) {
            console.log(err);
            return err;
        }
    })
}

async function sendPostCreationEmail(post, type = '') {
    const filePath = basePath + 'email-template/common-template';
    var productLink = process.env.FRONT_END_URL + `${post.type === 'product' ? 'product' : 'post'}/${post.slug}`;
    const payLoad = {
        NAME: post.createdBy.name,
        // PRODUCTNAME: post.name,
        LINK: productLink,
        CONTENT: `A ${type ? type : string.capitalize(post.type)} "${post.name}" has been created. Please Click here to check the details.`,
        SUBJECT: `${type ? type : string.capitalize(post.type)} Created`
        // TYPE: type ? type : string.capitalize(post.type)
    };
    await sendEmail({to: [post.createdBy.email]}, filePath, payLoad);
}

async function insertManyIntoPurchasedUnit(units) {
    console.log(units);
    const unitsAdded = new Promise((resolve, reject) => {
        Unit.insertMany(units, { ordered: false, rawResult: true }).then((d) => {
            console.log(d)
            resolve(d.ops.map(id => id._id));
        });
    })
    return unitsAdded;
}

async function getUserAssociatedWithPost(postId) {
    const result = await Post.aggregate([
        {
            $match: { _id: ObjectId(postId)}
        },
        {
           $lookup:
                {
                    from: 'comments',
                    localField: "_id",
                    foreignField: "referenceId",
                    as: "commentData"
                }
        },
        {
           $lookup:
                {
                    from: 'companies',
                    localField: "companies",
                    foreignField: "_id",
                    as: "companyData"
                }
        },
        {
            $lookup:
                 {
                     from: 'users',
                     localField: "createdBy",
                     foreignField: "_id",
                     as: "author"
                 }
        },
        {
            $group:
                {
                    _id: "$_id",
                    name: { $first: "$name"},
                    type: { $first: "$type"},
                    author: { $first: "$author"},
                    clients: { $first: "$clients"},
                    collaborators: { $first: "$collaborators"},
                    commentators: { $push: { ids: "$commentData.createdBy"}},
                    comapnyCreators: { $push: { ids: "$companyData.createdBy"}}
                }
        },
        {
            $lookup:
                {
                    from: "users",
                    localField: "collaborators",
                    foreignField: "_id",
                    as: "collaborators"
                }
        },
        {
            $lookup:
                {
                    from: "users",
                    localField: "clients",
                    foreignField: "_id",
                    as: "clients"
                }
        },
        {
            $lookup:
                {
                    from: "users",
                    localField: "commentators.ids",
                    foreignField: "_id",
                    as: "commentators"
                }
        },
        {
            $lookup:
                {
                    from: "users",
                    localField: "comapnyCreators.ids",
                    foreignField: "_id",
                    as: "companyOwners"
                }
        },
        {
            $project:
                {
                    name: 1,
                    type: 1,
                    author: 1,
                    collaborators: 1,
                    commentators: 1,
                    companyOwners: 1,
                    clients: 1
                }
        }
    ]).exec();

    return result;
}

module.exports = {
    checkIfUserIsAdmin,
    insertManyIntoTags,
    insertManyIntoCities,
    sendEmail,
    insertManyIntoPurchasedUnit,
    sendPostCreationEmail,
    sendEmailWithStaticContent
}