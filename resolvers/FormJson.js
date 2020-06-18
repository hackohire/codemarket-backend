const connectToMongoDB = require('../helpers/db');
const FormJson = require('./../models/FormJson')(); /** Impoer Tweet mongoose model */
const dbUrl = require('../models/dbUrl')();

let conn;

async function fetchFormStructureById(_, { formId }) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB();

            const formStructure = await FormJson.findById(formId).populate('connectedDB').exec();

            return resolve(formStructure);

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function addformJson(_, { formJson }, { headers }) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB('mongodb+srv://sumit:sumit@cluster0-6zfbz.mongodb.net/dro?retryWrites=true&w=majority');

            if (formJson._id) {
                const updatedForm = await FormJson.findByIdAndUpdate(formJson._id, formJson, {new: true});
                resolve(updatedForm);
            } else {
                /** This will convert quote object into the mongoose quote model */
                const obj = {
                    formname: formJson.formname,
                    formStructureJSON: formJson.formStructureJSON,
                    connectedDB: formJson.connectedDB._id
                };

                const int = new FormJson(obj);

                // int.connectedDB = formJson.connectedDB._id;
                /** Here we save the quote document into the database */
                await int.save(formJson).then(async (p) => {

                    resolve(p);
                });
            }

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function fetchformJson(_, ) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB();

            /** Find the tweets created by the user */
            const formJsonList = await FormJson.find({}).exec();
            return resolve(formJsonList);
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function addDbUrl(_, { name, mongoUrl }, {}) {
    return new Promise(async (resolve, reject) => {
        try {
            const conn = await connectToMongoDB();
            
            const obj = {
                name,
                mongoUrl
            }
            const int = new dbUrl(obj);

            const data = await int.save();
            console.log("123 ==> " ,data)
            await resolve(data);
        } catch (err) {
            console.log("Err in catch ==> ", err);
            reject(err);
        }
    });
}

async function addIntoAnotherDB(_, { formJson, collection } , { headers, db, decodedToken }) {
    return new Promise (async (resolve, reject) => {
        try {

            const obj = {
                formname: formJson.formname,
                formStructureJSON: formJson.formStructureJSON,
                connectedDB: formJson.connectedDB._id
            };

            const dbObj = await dbUrl.findOne({ _id: formJson.connectedDB._id });

            const conn = await connectToMongoDB(dbObj.mongoUrl);

            await conn.collection(collection).insertOne(obj);
            resolve(true);

        } catch (err) {
            console.log("Err in addIntoAnotherDb Catch  ==> ", err);
            reject(err);
        }
    });
}

module.exports = {
    addformJson,
    fetchformJson,
    fetchFormStructureById,
    addDbUrl,
    addIntoAnotherDB
}