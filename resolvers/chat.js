const connectToMongoDB = require('../helpers/db');
const twilio = require('../helpers/twilio');
let conn;

async function createdToken(_, { identity }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const twilioToken = await twilio.tokenGenerator(identity, '');
            if (twilio) {
               return resolve(twilioToken);
            }
        } catch (error) {
            console.log('Error in Chat', error);
            return reject(error);
        }
    })
}

module.exports = {
    createdToken
}