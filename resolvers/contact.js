const connectToMongoDB = require('../helpers/db');
const Contact = require('./../models/contact')(); /** Impoer Tweet mongoose model */

let conn;

async function getContact(_, { contact }, { headers }) {
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

async function addContact(_, { contact }, { headers, db, event }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const int = new Contact(contact);
            
            await int.save(contact).then(async (p) => {
                console.log(p);
                resolve(p);
            });
            
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}


async function fetchContacts(_,) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB();

            /** Find the tweets created by the user */
            const all_contacts = await Contact.find({}).exec();
            console.log(all_contacts)
            return resolve(all_contacts);
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

module.exports = {
    getContact,
    addContact,
    fetchContacts
}