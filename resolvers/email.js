const connectToMongoDB = require('../helpers/db');
const Email = require('../models/email')();
const Post = require('../models/post')();
const helper = require('../helpers/helper');
const auth = require('../helpers/auth');
let conn;

async function sendEmail(_, { email }, { event, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const user = await auth.auth(event.headers);


            /** If company is set add the company link */
            if (email.company) {
                let companyHTMLContent = `<div style="padding-top: 40px; text-align: left">Company: <a href="${process.env.FRONT_END_URL}company/${email.company._id}">
                ${email.company.name}</a></div>`
                email.description.push({
                    type: 'paragraph',
                    data: {
                        text: companyHTMLContent
                    }
                });

                email.descriptionHTML += companyHTMLContent;
            }

            /** Set Sent By */
            if (user) {
                let companyHTMLContent = `<div style="padding-top: 40px; text-align: left">Sent By: <a href="${process.env.FRONT_END_URL}dashboard/profile/${email.createdBy}">
                ${user.name}</a></div>`
                email.description.push({
                    type: 'paragraph',
                    data: {
                        text: companyHTMLContent
                    }
                });

                email.descriptionHTML += companyHTMLContent;
            }

            const templateFilepath = basePath + 'email-template/common-template';
            const payload = {
                HTML_CONTENT: email.descriptionHTML,
                SUBJECT: email.subject
            };
            const emailSent = await helper.sendEmail(email, templateFilepath, payload);

            if (emailSent) {

                /** Save the email */
                const int = await new Email(email);

                /** Save the email as a post too */
                const emailPost = { ...email };
                emailPost['name'] = emailPost.subject;
                emailPost['connectedEmail'] = int._id;
                const post = await new Post(emailPost);
                await post.save();


                /** Save the post slug into email also, because it can be required to fetch the post */
                int['slug'] = post['slug'];
                await int.save().then(async (p) => {
                    p.populate('createdBy').execPopulate().then(async populatedEmail => {
                        resolve(populatedEmail);
                    });
                });
            }
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

module.exports = {
    sendEmail
}