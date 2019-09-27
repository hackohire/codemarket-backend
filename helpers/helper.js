const nodemailer = require('nodemailer');
var auth = require('./auth');
const Tag = require('../models/tag')();
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

async function sendEmail(toEmail, filePath, body) {
    return new Promise(async (resolve, reject) => {
        try {
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
                const { html, subject } = result;
                const mailOptions = {
                    from: process.env.FROM_EMAIL,
                    to: toEmail,
                    replyTo: process.env.FROM_EMAIL,
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

        } catch (err) {
            return err;
        }
    })
}

async function sendPostCreationEmail(post, type = '') {
    const filePath = basePath + 'email-template/productCreate';
    var productLink = process.env.FRONT_END_URL + `(main:dashboard/${post.type}-details/${post._id})?type=${post.type}&postId=${post._id}`;
    const payLoad = {
        AUTHORNAME: post.createdBy.name,
        PRODUCTNAME: post.name,
        PRODUCTLINK: productLink,
        TYPE: type ? type : string.capitalize(post.type)
    };
    await sendEmail(post.createdBy.email, filePath, payLoad);
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

async function sendMessageToWebsocketClient(event, connectionId, postData, conn) {

    return new Promise(async (resolve, reject) => {

        const domain = event.requestContext.domainName;
        const stage = event.requestContext.stage;
        // const callbackUrlForAWS = 'https://i8zthpq9j3.execute-api.ap-south-1.amazonaws.com/prod'; 
        const callbackUrlForAWS = util.format(util.format('https://%s/%s', domain, stage));

        const apigwManagementApi = new AWS.ApiGatewayManagementApi({
            apiVersion: '2018-11-29',
            region: 'ap-south-1',
            endpoint: event.requestContext.domainName.includes('local') ? process.env.SOCKET_URL : callbackUrlForAWS
        });

        try {
            await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: JSON.stringify(postData) }).promise();
            return resolve('Sent');
        } catch (e) {
            if (e.statusCode === 410) {
                console.log(`Found stale connection, deleting ${connectionId}`);
                await conn.collection('connections').findOneAndDelete({ connectionId: connectionId });
                return resolve('Deleted');
            } else {
                return reject(e);
            }
        }
    });

}

module.exports = {
    checkIfUserIsAdmin,
    insertManyIntoTags,
    sendEmail,
    insertManyIntoPurchasedUnit,
    sendPostCreationEmail,
    sendMessageToWebsocketClient
}