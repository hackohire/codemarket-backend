const connectToMongoDB = require('../helpers/db');
const Homework = require('./../models/homework')();

let conn;

async function addHomework(_, { homework }, { headers }) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            
            conn = await connectToMongoDB();

            /** This will convert assignment object into the mongoose homework model */
            const int = new Homework(homework);

            /** Here we save homework document into the database */
            await int.save(homework).then(async (p) => {
                resolve(p);
            });
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

module.exports = {
    addHomework
}