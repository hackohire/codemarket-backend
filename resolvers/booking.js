const connectToMongoDB = require('../helpers/db');
const helper = require('../helpers/helper')
const Post = require('../models/post')();
const User = require('../models/user')();
let conn;

const bookSession = async (_, { post, actionBy }) => {
    return new Promise(async (resolve, reject) => {
        try {

            conn = await connectToMongoDB();
            let updatedPost;

            const filePath = basePath + 'email-template/common-template';
            const user = await User.findById(actionBy).exec();
            const postCreator = await User.findById(post.createdBy).exec();
            let payLoad;

            switch (post.mentor.status) {
                case 'REQUEST_SENT':
                    payLoad = {
                        NAME: postCreator.name,

                        HTML_CONTENT: `<p><a href="${process.env.FRONT_END_URL}user/${user.slug}">${user.name}</a> wants to book the mentoring session with you regarding <a href="${process.env.FRONT_END_URL}post/${post.slug}">${post.name}</a></p ><p>You can accept / reject.</p><p><a href="${process.env.FRONT_END_URL}post/${post.slug}/?accept=true">Accept</a> | <a href="${process.env.FRONT_END_URL}post/${post.slug}/?reject=true">Reject</a></p>`,

                        SUBJECT: `Mentoring Session Request`
                    };
                    await helper.sendEmail(postCreator.email, filePath, payLoad)

                    updatedPost = await Post.findByIdAndUpdate(post._id, { $set: { 'mentor.status': post.mentor.status }, $push: { 'mentor.requestBy': actionBy } }, { new: true }).exec();

                    break;
            }

            return resolve(updatedPost);




        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

module.exports = {
    bookSession
}