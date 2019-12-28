const connectToMongoDB = require('../helpers/db');
const helper = require('../helpers/helper');
const Comment = require('./../models/comment')();
const Product = require('./../models/product')();
const Post = require('./../models/post')();
const { pubSub } = require('../helpers/pubsub');
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
            var postLink;

            // const payload = { id: Math.random(), commentObj, type: 'COMMENT_ADDED'};

            await pubSub.publish('COMMENT_ADDED', commentObj);

            /** Send Email Only if comment type is post */
            if (commentObj.type === 'post') {
                data = await Post.findOne({ _id: commentObj.referenceId }).populate('createdBy').exec();

                postLink = process.env.FRONT_END_URL + `${commentObj.type === 'product' ? 'product' : 'post'}/${data.slug}?type=${data.type}`;
    
                const filePathToAuthor = basePath + 'email-template/commentCreateToAuthor';
                const filePathToCommentor = basePath + 'email-template/commentCreateToCommentor';
                const payLoadToAuthor = {
                    NAME: data.createdBy.name,
                    LINK: postLink,
                    COMMENTOR_NAME: commentObj.createdBy.name
                };
                const payLoadToCommentor = {
                    NAME: commentObj.createdBy.name,
                    LINK: postLink
                };
                await helper.sendEmail(data.createdBy.email, filePathToAuthor, payLoadToAuthor);
                await helper.sendEmail(commentObj.createdBy.email, filePathToCommentor, payLoadToCommentor);
            }
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

            await pubSub.publish('COMMENT_DELETED', c);
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

            await pubSub.publish('COMMENT_UPDATED', c);

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