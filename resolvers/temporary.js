const HelpGrowBusiness = require('./../models/temporary')();
const connectToMongoDB = require('../helpers/db');
let conn;


async function addHelpGrowBusiness(_, { helpGrowBusinessObject }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const int = await new HelpGrowBusiness(helpGrowBusinessObject);

            /** Save the post in the database */
            await int.save(helpGrowBusinessObject).then(async (p) => {
                resolve(p);
            });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

module.exports = {
    addHelpGrowBusiness,
}