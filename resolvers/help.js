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
                console.log(p.description)
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