const connectToMongoDB = require('../helpers/db');
const FormData = require('./../models/FormData')(); /** Impoer Tweet mongoose model */
const FormJson = require('./../models/FormJson')();

let conn;

async function addformData(_, { formData }, { headers }) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB();

            /** This will convert quote object into the mongoose quote model */
            const int = new FormData(formData);

            /** Here we save the quote document into the database */
            await int.save(formData).then(async (p) => {
                console.log(p)
                resolve(p);
            });
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function fetchformData(_,{ formId }) {
    return new Promise(async (resolve, reject) => {
        try {

            const actualForm = await FormJson.findOne({ _id: formId }).populate('connectedDB').exec();

            let formDataList;
            if (actualForm && actualForm.connectedDB && actualForm.connectedDB.mongoUrl) {
                conn = await connectToMongoDB(actualForm.connectedDB.mongoUrl);

                formDataList = await FormData.find({ connectedFormStructureId: formId }).exec();
                conn = await connectToMongoDB(process.env.MONGODB_URL);
                console.log("form List ==> ", formDataList);
            } else {
                conn = await connectToMongoDB();

                formDataList = await FormData.find({ connectedFormStructureId: formId }).exec();
            }
            return resolve(formDataList);
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function fetchFormDataFromAnotherDB(_, { dbUrl, collection }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {

    });
}
module.exports = {
    addformData,
    fetchformData,
    fetchFormDataFromAnotherDB
}