const connectToMongoDB = require('../helpers/db');
const MakeMoney = require('./../models/makeMoney')(); /** Impoer Tweet mongoose model */

let conn;

async function addMakeMoney(_, { makeMoney }, { headers }) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB();

            /** This will convert quote object into the mongoose quote model */
            const int = new MakeMoney(makeMoney);

            /** Here we save the quote document into the database */
            await int.save(makeMoney).then(async (p) => {
                resolve(p);
            });
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function fetchMakeMoney(_,) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB();

            /** Find the tweets created by the user */
            const makeMoneyList = await MakeMoney.find({}).exec();
            console.log(makeMoneyList)
            return resolve(makeMoneyList);
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}


module.exports = {
    addMakeMoney,
    fetchMakeMoney
}