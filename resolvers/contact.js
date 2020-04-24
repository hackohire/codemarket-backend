const connectToMongoDB = require('../helpers/db');
const Contact = require('./../models/contact')(); /** Impoer Tweet mongoose model */

let conn;

async function addcontact(_, { contact }, { headers }) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB();

            /** This will convert quote object into the mongoose quote model */
            const int = new Contact(contact);

            /** Here we save the quote document into the database */
            await int.save(contact).then(async (p) => {
                resolve(p);
            });
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function fetchcontact(_,) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB();

            /** Find the tweets created by the user */
            const contactList = await Contact.find({}).exec();
            console.log(contactList)
            return resolve(contactList);
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}



module.exports = {
    addcontact,
    fetchcontact
}