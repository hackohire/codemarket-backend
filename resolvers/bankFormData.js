const connectToMongoDB = require('../helpers/db');
const BankFormDataRef = require('./../models/bankFormDataRef')(); /** Impoer Tweet mongoose model */

let conn;

async function addBankFormDataRef(_, { bankFormDataRef }, { headers }) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB();

            /** This will convert quote object into the mongoose quote model */
            const int = new BankFormDataRef(bankFormDataRef);

            /** Here we save the quote document into the database */
            await int.save(bankFormDataRef).then(async (p) => {
                console.log(p)
                return resolve(p);
            });
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function getBankFormDataRefByCompanyName(_,{companyName}) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB();

            /** Find the tweets created by the user */
            let condition = {'companyName': companyName}
            const bankFormDataRefList = await BankFormDataRef.find(condition).exec();
            console.log(bankFormDataRefList)
            return resolve(bankFormDataRefList);
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}


module.exports = {
    addBankFormDataRef,
    getBankFormDataRefByCompanyName
}