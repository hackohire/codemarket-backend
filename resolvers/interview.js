const connectToMongoDB = require('../helpers/db');
const Interview = require('../models/interview')();
const helper = require('../helpers/helper');
let conn;

async function addInterview(_, { interview }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            if (interview.tags && interview.tags.length) {
                interview.tags = await helper.insertManyIntoTags(interview.tags);
            }


            const int = await new Interview(interview);
            await int.save(interview).then(async p => {
                console.log(p)

                p.populate('createdBy').populate('tags').execPopulate().then(populatedInterview => {
                    return resolve(populatedInterview);
                })
                // return resolve([a]);

            });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function getInterviewsByUserId(_, { userId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Interview.find({ 'createdBy': userId }).populate('createdBy').populate('tags').exec((err, res) => {

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

async function getInterviewById(_, { interviewId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Interview.findById(interviewId).populate('createdBy').populate('tags').exec((err, res) => {

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

async function getAllInterviews(_, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Interview.find({}).populate('createdBy').populate('tags').exec((err, res) => {

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

async function updateInterview(_, { interview }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            if (interview.tags && interview.tags.length) {
                interview.tags = await helper.insertManyIntoTags(interview.tags);
            }


            await Interview.findByIdAndUpdate(interview._id, interview, {new: true}, (err, res) => {
                if (err) {
                    return reject(err)
                }

                res.populate('createdBy').populate('tags').execPopulate().then((d) => {
                    return resolve(d);
                });
            });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function deleteInterview(_, { interviewId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Interview.deleteOne({_id: interviewId}, ((err, res) => {

                if (err) {
                    return reject(err)
                }

                return resolve(res.deletedCount);
                })
            );



        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

module.exports = {
    addInterview,
    getInterviewsByUserId,
    getInterviewById,
    getAllInterviews,
    updateInterview,
    deleteInterview
}