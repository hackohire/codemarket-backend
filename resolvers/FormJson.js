const connectToMongoDB = require('../helpers/db');
const FormJson = require('./../models/FormJson')(); /** Impoer Tweet mongoose model */

let conn;

async function addformJson(_, { formJson }, { headers }) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB();

            /** This will convert quote object into the mongoose quote model */
            const int = new FormJson(formJson);

            /** Here we save the quote document into the database */
            await int.save(formJson).then(async (p) => {
                console.log(p)
                resolve(p);
            });
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function fetchformJson(_,) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB();

            /** Find the tweets created by the user */
            const formJsonList = await FormJson.find({}).exec();
            console.log(formJsonList)
            return resolve(formJsonList);
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}


module.exports = {
    addformJson,
    fetchformJson
}