const connectToMongoDB = require('../helpers/db');
const Interview = require('../models/interview')();
let conn;

async function addInterview(_, { interview }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }


            const int = await new Interview(interview);
            await int.save(interview).then(async p => {
                console.log(p)

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
    addInterview
}