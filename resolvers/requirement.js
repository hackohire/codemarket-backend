const connectToMongoDB = require('../helpers/db');
const Requirement = require('../models/requirement')();
let conn;

async function addRequirement(_, { requirement }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }


            const int = await new Requirement(requirement);
            await int.save(requirement).then(async p => {
                console.log(p)

                return resolve(p);
                // return resolve([a]);

            });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function getRequirementsByUserId(_, { userId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Requirement.find({ 'createdBy': userId }).populate('createdBy').exec((err, res) => {

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

async function getRequirementById(_, { helpQueryId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Requirement.findById(helpQueryId).populate('createdBy').exec((err, res) => {

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

async function getAllRequirements(_, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Requirement.find({}).populate('createdBy').exec((err, res) => {

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
    addRequirement,
    getRequirementsByUserId,
    getRequirementById,
    getAllRequirements

}