const connectToMongoDB = require('../helpers/db');
const Help = require('../models/help')();
const sendEmail = require('../helpers/ses_sendTemplatedEmail');
const User = require('./../models/user')();
let conn;

async function addQuery(_, { helpQuery }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            console.log(helpQuery)
            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const h = await new Help(helpQuery);
            await h.save(helpQuery).then(async p => {
                console.log(p)

                // User.find({'roles': 'Admin'}, (err, admins) => {
                //     if(err) { console.log(err) }
                //     else {
                //         admins.forEach((admin, i) => {
                //             const params = {...sendEmail.emailParams};
                //             params.Template = 'ProductCreationNotificationToAdmin',
                //             params.Source = 'sumitvekariya7@gmail.com',
                //             params.Destination.ToAddresses = [admin.email], // 'sumi@dreamjobb.com'
                //             params.TemplateData = JSON.stringify({
                //                 'name': admin.name,
                //                 'productName': p.name,
                //                 'link': `${process.env.FRONT_END_URL}/#/application/applications/${p._id}`,
                //                 'productDetails': `${p.description}`
                //             });
                //             sendEmail.sendTemplatedEmail(params);
                //         })
                //     }
                // })

                return resolve(p);
                // return resolve([a]);

            });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

module.exports = {
    addQuery
}