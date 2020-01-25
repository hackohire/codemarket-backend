const Category = require('../models/tag')();
const connectToMongoDB = require('../helpers/db');
let conn;

/** Search Tag or Cities */
async function findFromCollection(_, { keyWord, searchCollection, type }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                conn = db;
                console.log('Using existing mongoose connection.');
            }


            var regex = new RegExp(keyWord, 'i');
            const cat = await conn.collection(searchCollection).find({ name: { $regex: regex } }).toArray();

            return resolve(cat);




        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

/** Add Tag or Cities */
async function addToCollection(_, { keyWord, searchCollection, type }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                conn = db;
                console.log('Using existing mongoose connection.');
            }


            // var regex = new RegExp('/^' + keyWord + '$/', 'i');
            const cat = await conn.collection(searchCollection).update(
            { name: keyWord},
            { $setOnInsert: { name: keyWord, type } },
            { upsert: true });
            
            const response = {name: keyWord, _id: cat.result.upserted[0]._id.toString(), type};

            return resolve(response);




        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

module.exports = {
    findFromCollection,
    addToCollection
}