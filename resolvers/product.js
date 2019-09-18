const connectToMongoDB = require('../helpers/db');
const Product = require('../models/product')();
const helper = require('../helpers/helper');
const sendEmail = require('../helpers/ses_sendTemplatedEmail');
const User = require('./../models/user')();
const Comment = require('./../models/comment')();
const Like = require('./../models/like')();
const Unit = require('../models/purchased_units')();
let conn;


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
                const filePath = basePath + 'email-template/productCreate.html';
                helper.getHtmlContent(filePath, (err, htmlContent) => {
                    var productLink = process.env.FRONT_END_URL + '(main:dashboard/product-details/' + sd.referenceId +')';
                    htmlContent = htmlContent.replace("{AUTHORNAME}", sd.createdBy.name);
                    htmlContent = htmlContent.replace("{PRODUCTNAME}", sd.name);
                    htmlContent = htmlContent.replace("{PRODUCTLINK}", productLink);
                    helper.sendEmail(sd.createdBy.email, "Product Created", htmlContent);
                });
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
                                // helper.getHtmlContent('productCreate', (err, htmlContent) => {
                                //     htmlContent = htmlContent.replace("{name}", admin.name);
                                //     htmlContent = htmlContent.replace("{productName}", p.name);
                                //     htmlContent = htmlContent.replace("{link}", `${process.env.FRONT_END_URL}/#/application/applications/${p._id}`);
                                //     htmlContent = htmlContent.replace("{productDetails}", `${p.description}`);
                                //     helper.sendEmail(admin.email, "Product creation", htmlContent);
                                // });
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

            await Product.findByIdAndUpdate(product._id, product, {new: true}, (err, res) => {
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



async function getProductsByUserId(_, { userId, status }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Product.find({ 'createdBy': userId, status: status ? status : { $ne: null} }).populate('createdBy').populate('tags').exec((err, res) => {

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

            /** Fetch a Product by Id */
            Product.findById(productId).populate('createdBy').populate('tags').exec(async (err, res) => {

                if (err) {
                    return reject(err)
                }

                /** List of users who purchased the bugfix */
                let usersWhoPurchased = [];

                /** Find the unitsSold by reference_id stored as productId while purchase and populate userwho purchased */
                const unitsSold = await Unit.find({reference_id: productId})
                    .select('purchasedBy createdAt')
                    .populate({path: 'purchasedBy', select: 'name avatar'})
                    .exec();



                /** If there is more than 0 units */
                if (unitsSold && unitsSold.length) {

                    /** Map the array into the fileds "name", "_id", "createdAt" & "avatar" */
                    usersWhoPurchased = unitsSold.map((u) => {
                                            let userWhoPurchased = {};
                                            userWhoPurchased = u.purchasedBy;
                                            userWhoPurchased.createdAt = u.createdAt;
                                            return userWhoPurchased;
                                        });
                }

                const likeCount = await Like.count({referenceId: productId})

                res['likeCount'] = likeCount;

                /** attach "purchasedBy" with the response */
                res['purchasedBy'] = usersWhoPurchased;

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

            Product.find({status: 'Published'}).populate('createdBy').populate('tags').exec((err, res) => {

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





module.exports = {
    addProduct,
    updateProduct,
    getAllProducts,
    getProductsByUserId,
    getProductById,
    deleteProduct,
}