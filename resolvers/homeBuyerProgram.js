const connectToMongoDB = require('../helpers/db');
const HomeBuyerProgram = require('./../models/homeBuyerProgram')(); /** Impoer Tweet mongoose model */

let conn; 

async function addHomeBuyerProgram(_, { homeBuyerProgram }, { headers }) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB();

            /** This will convert quote object into the mongoose quote model */
            const int = new HomeBuyerProgram(homeBuyerProgram);

            /** Here we save the quote document into the database */
            await int.save(homeBuyerProgram).then(async (p) => {
                console.log(p)
                return resolve(p);
            });
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function fetchHomeBuyerProgram(_,{location}) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB();

            /** Find the tweets created by the user */
            let condition = {'location': location}
            const programList = await HomeBuyerProgram.find(condition).exec();
            console.log(programList)
            return resolve(programList);
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}


module.exports = {
    addHomeBuyerProgram,
    fetchHomeBuyerProgram
}