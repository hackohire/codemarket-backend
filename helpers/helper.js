const nodemailer = require('nodemailer');
const fs = require('fs');
var auth = require('./auth');
const Tag = require('../models/tag')();

async function checkIfUserIsAdmin (decodedToken) {
    const isUserAdmin = new Promise((resolve, reject) => {
        decodedToken.then((res, err) => {
            // console.log(res);
            if(err) reject(err);
            if (res && res['cognito:groups'] && res['cognito:groups'].length) {
                // console.log(res['cognito:groups'].indexOf('Admin'))
                resolve(res['cognito:groups'].indexOf('Admin') > -1);
            }
        });
    });
    return isUserAdmin;
}

async function insertManyIntoTags(tags) {
    console.log(tags);
    const tagsAdded = new Promise((resolve, reject) => {
        Tag.insertMany(tags, {ordered: false, rawResult: true}).then((d) => {
            console.log(d)
            resolve(d.ops.map(id => id._id));
        });
    })
    return tagsAdded;
}

async function sendEmail(toEmail, subject, body) {
    console.log(toEmail, "==> ", subject, "==>", body)
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
        transporter.sendMail({
            from: process.env.fromEmail,
            to: toEmail,
            subject: subject,
            html: body
        }, (error, response) => {
            if (error) {
                return false;
            } else {
                return true;
            }
        });
    } catch(err) {
        console.log("THis is Catch Block ==>", err);
        return err;
    }
}

async function getHtmlContent(flag, cb) {
    var filePath = '';
    try {
        if (flag === 'productCreate') {
            filePath = basePath + 'email-template/productCreate.html';
        }
        if (flag === 'commentFlag') {
            filePath = basePath + 'email-template/commentCreate.html';
        }
        fs.readFile(filePath, 'utf8',(err, html) => {
            if (err) {
                cb(err);
            } else {
                cb(null, html);
            }
        });
    } catch (err) {
        cb(err);
    }
}

module.exports = {
    checkIfUserIsAdmin,
    insertManyIntoTags,
    sendEmail,
    getHtmlContent
}