const connectToMongoDB = require('../helpers/db');
const Comment = require('./../models/comment')();
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
                    console.log(com);
                    await com.populate('createdBy').execPopulate();
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


            let subdiscussion = await Comment.find({referenceId: referenceId})
            .populate('createdBy')
            .populate({path: 'children', populate: {path: 'createdBy'}}).exec();
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


            let subdiscussion = await Comment.findById(commentId)
            .populate('createdBy')
            .populate({path: 'children', populate: {path: 'children'}})
            .populate({path: 'parents', populate: {path: 'parents'}}).exec();
            // subdiscussion = subdiscussion.sort('full_slug')
            console.log(subdiscussion);
            resolve(subdiscussion);


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

module.exports = {
    addComment,
    getComments,
    getCommentsByReferenceId
}