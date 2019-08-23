const connectToMongoDB = require('../helpers/db');
const Product = require('../models/product')();
const helper = require('../helpers/helper');
const sendEmail = require('../helpers/ses_sendTemplatedEmail');
const User = require('./../models/user')();
const Comment = require('./../models/comment')();
let conn;


function generateSlug() {

    let slug = '';
    let chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 5; i++) {
        slug += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return slug;
}

async function addProduct(_, { product }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            if (product.tags && product.tags.length) {
                product.tags = await helper.insertManyIntoTags(product.tags);
            }

            const prod = await new Product(product);
            const savedProduct = await prod.save(product);
            savedProduct.populate('createdBy').populate('tags').execPopulate().then((sd) => {
                console.log(sd);
                return resolve(sd)
            });
            // await prod.save(product).then(async p => {
            //     console.log(p.)

            //     // User.find({'roles': 'Admin'}, (err, admins) => {
            //     //     if(err) { console.log(err) }
            //     //     else {
            //     //         admins.forEach((admin, i) => {
            //     //             const params = {...sendEmail.emailParams};
            //     //             params.Template = 'ProductCreationNotificationToAdmin',
            //     //             params.Source = 'sumitvekariya7@gmail.com',
            //     //             params.Destination.ToAddresses = [admin.email], // 'sumi@dreamjobb.com'
            //     //             params.TemplateData = JSON.stringify({
            //     //                 'name': admin.name,
            //     //                 'productName': p.name,
            //     //                 'link': `${process.env.FRONT_END_URL}/#/application/applications/${p._id}`,
            //     //                 'productDetails': `${p.description}`
            //     //             });
            //     //             sendEmail.sendTemplatedEmail(params);
            //     //         })
            //     //     }
            //     // })

            //     return resolve(p);
            //     // return resolve([a]);

            // });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}


async function updateProduct(_, { product }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            if (product.tags && product.tags.length) {
                product.tags = await helper.insertManyIntoTags(product.tags);
            }


            await Product.findByIdAndUpdate(product._id, product, (err, res) => {
                if (err) {
                    return reject(err)
                }

                res.populate('createdBy').populate('tags').execPopulate().then((d) => {
                    return resolve(d);
                });
            });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}



async function getProductsByUserId(_, { userId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Product.find({ 'createdBy': userId }).populate('createdBy').populate('tags').exec((err, res) => {

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

async function getProductById(_, { productId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Product.findById(productId).populate('createdBy').populate('tags').exec((err, res) => {

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

async function getAllProducts(_, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Product.find({}).populate('createdBy').populate('tags').exec((err, res) => {

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

async function deleteProduct(_, { productId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Product.deleteOne({ _id: productId }, ((err, res) => {

                if (err) {
                    return reject(err)
                }

                return resolve(res.deletedCount);
            })
            );



        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

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
                // let parentCommentId = c.parents[c.parents.length - 1];


                const pcForChildren = await Comment.findById(c.parentId).exec();

                await pcForChildren.children.push(c._id);

                await pcForChildren.update({children: pcForChildren.children});

                const parentComment = await Comment.findById(c.parentId).exec();
                
                parentComment.parents.push(c._id);

                c.parents = parentComment.parents;

                await c.save().then( async (com) => {
                    console.log(com);
                    await com.populate('parents').populate('children').execPopulate();
                    resolve(com);
                })

            } else {
                //  actually insert the parent comment
                c.parents.push(c._id);
                await c.save().then( async (com) => {
                    console.log(com);
                    await com.populate('parents').execPopulate();
                    resolve(com);
                })
            }


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

            // let subdiscussion = await Comment.findOne({
            //     'discussion_id': commentId,
            //     'full_slug': { $regex: '/^/'} }).exec();

            let subdiscussion = await Comment.findById(commentId)
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
    addProduct,
    updateProduct,
    getAllProducts,
    getProductsByUserId,
    getProductById,
    deleteProduct,
    addComment,
    getComments
}