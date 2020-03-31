const nodemailer = require('nodemailer');
var auth = require('./auth');
const Tag = require('../models/tag')();
const City = require('../models/city')();
const Unit = require('../models/purchased_units')();
const { EmailTemplate } = require('email-templates-v2');
var string = require('lodash/string');
const AWS = require('aws-sdk');
const util = require('util');


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

async function sendEmail(recepients, filePath, body) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!process.env.IS_OFFLINE) {
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

                const renderedTemplate = await template.render(body);

                const mailOptions = {
                    from: process.env.FROM_EMAIL,
                    to: recepients.to,
                    cc: recepients.cc,
                    bcc: recepients.bcc,
                    replyTo: process.env.FROM_EMAIL,
                    subject: renderedTemplate.subject,
                    html: renderedTemplate.html,
                }; 

                const emailSent = await transporter.sendMail(mailOptions);

                if (emailSent) {
                    return resolve(true);
                } else {
                    return reject(false);
                }
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



module.exports = {
    checkIfUserIsAdmin,
    insertManyIntoTags,
    insertManyIntoCities,
    sendEmail,
    insertManyIntoPurchasedUnit,
    sendPostCreationEmail
}