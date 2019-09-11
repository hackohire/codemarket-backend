const connectToMongoDB = require('../helpers/db');
const helper = require('../helpers/helper');
const Comment = require('./../models/comment')();
const Product = require('./../models/product')();
const Query = require('./../models/help')();
const Requirement = require('./../models/requirement')();
let conn;

async function addComment(_, { comment }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const c = new Comment(comment);

            if (c.parentId) {

                const pcForChildren = await Comment.findById(c.parentId).exec();

                await pcForChildren.children.push(c._id);

                await pcForChildren.update({children: pcForChildren.children});

                await c.save().then( async (com) => {
                    console.log(com);
                    await com.populate('createdBy').populate('children').execPopulate();
                    resolve(com);
                })

            } else {
                //  actually insert the parent comment
                c.parents.push(c._id);
                await c.save().then( async (com) => {
                    await com.populate('createdBy').execPopulate();
                    var data;
                    if (com.type === 'product') {
                        data = await Product.findOne({ _id: com.referenceId }).populate('createdBy').exec();
                    }
                    if (com.type === 'help-request') {
                        data = await Query.findOne({ _id: com.referenceId }).populate('createdBy').exec();
                    }
                    // if (com.type === 'requirement') {
                    //     data = await Requirement.findOne({ _id: com.referenceId }).populate('createdBy').exec();
                    // }
                    const filePath = basePath + 'email-template/commentCreate.html';
                    helper.getHtmlContent(filePath, (err, htmlContent) => {
                        var commentLink = process.env.COMMENT_URL+com.referenceId+')';
                        htmlContent = htmlContent.replace("{NAME}", data.createdBy.name);
                        htmlContent = htmlContent.replace("{LINK}", commentLink);
                        helper.sendEmail(data.createdBy.email, "Comment Created", htmlContent);
                    });
                    resolve(com);
                })
            }


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}


async function getCommentsByReferenceId(_, { referenceId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }


            let subdiscussion = await Comment.find({referenceId: referenceId, parentId: null, status: { $ne: 'Deleted' }})
            .populate('createdBy')
            .populate({path: 'children', match: { status: { $ne: 'Deleted' }}, populate: {path: 'createdBy'}}).exec();
            // subdiscussion = subdiscussion.sort('full_slug')
            console.log(subdiscussion);
            resolve(subdiscussion);


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}



async function getComments(_, { commentId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }


            let subdiscussion = await Comment.find({_id: commentId, status: { $ne: 'Deleted' }})
            .populate('createdBy')
            .populate({path: 'children', match: { status: { $ne: 'Deleted' }}, populate: {path: 'children', match: { status: { $ne: 'Deleted' }}}}).exec();
            resolve(subdiscussion);


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function deleteComment(_, { commentId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }


            let c = await Comment.findByIdAndUpdate(commentId, { status: 'Deleted' }).exec();

            return resolve(c._id);
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}


async function updateComment(_, { commentId, text }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }


            let c = await Comment.findByIdAndUpdate(commentId, { text: text }, { new: true }).exec();

            return resolve(c);
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

module.exports = {
    addComment,
    getComments,
    getCommentsByReferenceId,
    deleteComment,
    updateComment
}