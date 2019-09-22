const connectToMongoDB = require('../helpers/db');
const helper = require('../helpers/helper');
const Comment = require('./../models/comment')();
const Product = require('./../models/product')();
const Query = require('./../models/help')();
const Requirement = require('./../models/requirement')();
const Interview = require('./../models/interview')();
const Testing = require('./../models/testing')();
const Design = require('./../models/design')();
const Howtodoc = require('./../models/how-to-doc')();
const Goal = require('./../models/goal')();
let conn;

async function addComment(_, { comment }, { headers, db, decodedToken, context }) {
    return new Promise(async (resolve, reject) => {
        try {

            console.log(context)

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const c = new Comment(comment);
            let commentObj;
            if (c.parentId) {

                const pcForChildren = await Comment.findById(c.parentId).exec();

                await pcForChildren.children.push(c._id);

                await pcForChildren.update({children: pcForChildren.children});

                await c.save().then( async (com) => {
                    console.log(com);
                    await com.populate('createdBy').populate('children').execPopulate();
                    commentObj = com;
                    // resolve(com);
                })

            } else {
                //  actually insert the parent comment
                c.parents.push(c._id);
                await c.save().then( async (com) => {
                    await com.populate('createdBy').execPopulate();
                    commentObj = com;
                    // resolve(com);
                })
            }
            var data;
            var commentLink
            if (commentObj.type === 'product') {
                data = await Product.findOne({ _id: commentObj.referenceId }).populate('createdBy').exec();
            } else if (commentObj.type === 'help-request') {
                data = await Query.findOne({ _id: commentObj.referenceId }).populate('createdBy').exec();
            } else if (commentObj.type === 'interview') {
                data = await Interview.findOne({ _id: commentObj.referenceId }).populate('createdBy').exec();
            } else if (commentObj.type === 'requirement') {
                data = await Requirement.findOne({ _id: commentObj.referenceId }).populate('createdBy').exec();
            } else if (commentObj.type === 'testing') {
                data = await Testing.findOne({ _id: commentObj.referenceId }).populate('createdBy').exec();
            } else if (commentObj.type === 'design') {
                data = await Design.findOne({ _id: commentObj.referenceId }).populate('createdBy').exec();
            } else if (commentObj.type === 'howtodoc') {
                data = await Howtodoc.findOne({ _id: commentObj.referenceId }).populate('createdBy').exec();
            } else if (commentObj.type === 'goal') {
                data = await Goal.findOne({ _id: commentObj.referenceId }).populate('createdBy').exec();
            }

            commentLink = process.env.FRONT_END_URL + `(main:dashboard/${commentObj.type}-details/' + commentObj.referenceId +')`;

            // if (com.type === 'requirement') {
            //     data = await Requirement.findOne({ _id: com.referenceId }).populate('createdBy').exec();
            // }
            const filePathToAuthor = basePath + 'email-template/commentCreateToAuthor';
            const filePathToCommentor = basePath + 'email-template/commentCreateToCommentor';
            const payLoadToAuthor = {
                NAME: data.createdBy.name,
                LINK: commentLink,
                COMMENTOR_NAME: commentObj.createdBy.name
            };
            const payLoadToCommentor = {
                NAME: commentObj.createdBy.name,
                LINK: commentLink
            };
            await helper.sendEmail(data.createdBy.email, filePathToAuthor, payLoadToAuthor);
            await helper.sendEmail(commentObj.createdBy.email, filePathToCommentor, payLoadToCommentor);
            resolve(commentObj);
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