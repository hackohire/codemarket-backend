const connectToMongoDB = require('../helpers/db');
const helper = require('../helpers/helper');
const FormData = require('./../models/FormData')(); /** Impoer Tweet mongoose model */

let conn;

async function addformData(_, { formData }, { headers }) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB();
            let formDataObj;

            /** This will convert quote object into the mongoose quote model */
            const int = new FormData(formData);

            /** Here we save the quote document into the database */
            await int.save(formData).then(async (p) => {
                console.log(p)
                formDataObj = p.formDataJson;
                return resolve(p);
            });
            const filePath = basePath + 'email-template/common-template';
            const payLoadToOtherUsers = {
                NAME: formDataObj.firstName,
                CONTENT: `First Name : ${formDataObj.firstName }  , Last Name : ${formDataObj.lastName} ,   Email :  ${formDataObj.email} ,  Estimated  ${formDataObj.estimatedPurchasePrice}`,
                SUBJECT: `New Subscriber Details : ${formDataObj.firstName }`
            };
            await helper.sendEmail({ to: "mayurshin.vaghela43@gmail.com"}, filePath, payLoadToOtherUsers);


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function fetchformData(_,{formname}) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB();

            /** Find the tweets created by the user */
            let condition = {'formname': formname}
            const formDataList = await FormData.find(condition).exec();
            console.log(formDataList)
            return resolve(formDataList);
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function fetchformDataById(_,{_id,connectedFormStructureId}) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB();
            let condition = {'company': _id, 'connectedFormStructureId':connectedFormStructureId}
            const formDataList = await FormData.find(condition).exec();
            console.log(formDataList)
            return resolve(formDataList);
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}


module.exports = {
    addformData,
    fetchformData,
    fetchformDataById
}