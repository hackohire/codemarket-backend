const connectToMongoDB = require('../helpers/db');
const Quote = require('./../models/quote')();

let conn;

async function getQuote(_, { quote }, { headers }) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB();

            /** This will convert quote object into the mongoose quote model */
            const int = new Quote(quote);

            /** Here we save the quote document into the database */
            await int.save(quote).then(async (p) => {
                resolve(p);
            });
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });

}


module.exports = {
    getQuote
}