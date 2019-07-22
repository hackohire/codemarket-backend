const connectToMongoDB = require('../helpers/db');
const Product = require('../models/product')();
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
            await prod.save(product).then(async a => {
                console.log(a)

                // const params = {...sendEmail.emailParams};
                // params.Template = 'AppCreationNotificationToAdmin',
                // params.Source = 'sumitvekariya7@gmail.com',
                // params.Destination.ToAddresses = ['sumitvekariya7@gmail.com'],
                // params.TemplateData = JSON.stringify({
                //     'name': 'Sumit',
                //     'appName': application.name,
                //     'link': `${process.env.FRONT_END_URL}/#/application/applications/${a._id}`
                // });
                // sendEmail.sendTemplatedEmail(params);
                // db.disconnect();
                return resolve(a);
                // return resolve([a]);

            });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

module.exports = {
    addProduct
}