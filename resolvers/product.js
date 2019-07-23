const connectToMongoDB = require('../helpers/db');
const Product = require('../models/product')();
const sendEmail = require('../helpers/ses_sendTemplatedEmail');
const User = require('./../models/user')();
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


            const prod = await new Product(product);
            await prod.save(product).then(async p => {
                console.log(p)

                User.find({'roles': 'Admin'}, (err, admins) => {
                    if(err) { console.log(err) }
                    else {
                        admins.forEach((admin, i) => {
                            const params = {...sendEmail.emailParams};
                            params.Template = 'ProductCreationNotificationToAdmin',
                            params.Source = 'sumitvekariya7@gmail.com',
                            params.Destination.ToAddresses = [admin.email], // 'sumi@dreamjobb.com'
                            params.TemplateData = JSON.stringify({
                                'name': admin.name,
                                'productName': p.name,
                                'link': `${process.env.FRONT_END_URL}/#/application/applications/${p._id}`,
                                'productDetails': `${p.description}`
                            });
                            sendEmail.sendTemplatedEmail(params);
                        })
                    }
                })

                return resolve(p);
                // return resolve([a]);

            });


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

            await Product.findByIdAndUpdate(product._id, product, (err, res) => {
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



async function getProductsByUserId(_, { userId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Product.find({ 'createdBy': userId }, (err, res) => {

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

            Product.findById(productId, (err, res) => {

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

module.exports = {
    addProduct,
    updateProduct,
    getProductsByUserId,
    getProductById
}