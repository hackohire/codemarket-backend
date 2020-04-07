const connectToMongoDB = require('../helpers/db');
const PostType = require('../models/post-type')();
const helper = require('../helpers/helper');
const Field = require('../models/fields');
var ObjectID = require('mongodb').ObjectID;

let conn;


async function addPostType(_, { postType }, { headers }) {
    return new Promise(async (resolve, reject) => {
        try {

            conn = await connectToMongoDB();

            const int = await new PostType(postType);
            await int.save(postType).then(async (p) => {
                console.log(p)
                resolve(p);
            });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function fetchPostTypes(_, temp, { headers }) {
    return new Promise(async (resolve, reject) => {
        try {

            conn = await connectToMongoDB();

            PostType.find({ status: 'Published' }).exec((err, res) => {
                if (err) {
                    return reject(err)
                }
                return resolve(res);
            });
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function fetchFields(_, temp, { headers }) {
    return new Promise(async (resolve, reject) => {
        try {

            conn = await connectToMongoDB();

            Field.find({ status: 'Published' }).exec((err, res) => {
                if (err) {
                    return reject(err)
                }
                return resolve(res);
            });
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function updatePostType(_, { postType }, { headers }) {
    return new Promise(async (resolve, reject) => {
        try {

            conn = await connectToMongoDB();

            await PostType.findOneAndUpdate({ _id: postType._id }, postType, { new: true, useFindAndModify: false }, async (err, res) => {
                if (err) {
                    return reject(err)
                }
                res.exec.then(async (d) => {
                    return resolve(d);
                });
            });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}



async function deletePostType(_, { postId }) {
    return new Promise(async (resolve, reject) => {
        try {
            conn = await connectToMongoDB();

            PostType.findOneAndDelete({ _id: postId }, (async (err, res) => {
                return resolve(res ? 1 : 0);
            })
            );



        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}


module.exports = {
    /** Queries */
    fetchPostTypes,
    fetchFields,

    /** Mutations */
    addPostType,
    updatePostType,
    deletePostType,
}