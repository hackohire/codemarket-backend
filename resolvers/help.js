const connectToMongoDB = require('../helpers/db');
const HelpRequest = require('../models/help')();
// const sendEmail = require('../helpers/ses_sendTemplatedEmail');
const User = require('./../models/user')();
let conn;

async function addQuery(_, { helpQuery }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            console.log(helpQuery)
            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const h = await new HelpRequest(helpQuery);
            await h.save(helpQuery).then(async p => {
                console.log(p.description)
                return resolve(p);
                // return resolve([a]);

            });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function getHelpRequestsByUserId(_, { userId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            HelpRequest.find({ 'createdBy': userId }).populate('createdBy').exec((err, res) => {

                if (err) {
                    return reject(err)
                }

                return resolve(res);
            });



        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function getHelpRequestById(_, { helpRequestId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            HelpRequest.findById(helpRequestId).populate('createdBy').exec((err, res) => {

                if (err) {
                    return reject(err)
                }

                return resolve(res);
            });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function getAllHelpRequests(_, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            HelpRequest.find({}).populate('createdBy').exec((err, res) => {

                if (err) {
                    return reject(err)
                }

                return resolve(res);
            });



        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

module.exports = {
    addQuery,
    getHelpRequestsByUserId,
    getHelpRequestById,
    getAllHelpRequests
}