const connectToMongoDB = require('../helpers/db');
const Goal = require('../models/goal')();
const helper = require('../helpers/helper');
const Like = require('./../models/like')();
let conn;

async function addGoal(_, { goal }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            if (goal.tags && goal.tags.length) {
                goal.tags = await helper.insertManyIntoTags(goal.tags);
            }


            const int = await new Goal(goal);
            await int.save(goal).then(async p => {
                console.log(p)

                p.populate('createdBy').populate('tags').execPopulate().then(populatedGoal => {
                    return resolve(populatedGoal);
                })
                // return resolve([a]);

            });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function getGoalsByUserId(_, { userId, status }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Goal.find({ 'createdBy': userId, status: status ? status : { $ne: null} }).populate('createdBy').populate('tags').exec((err, res) => {

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

async function getGoalById(_, { goalId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Goal.findById(goalId).populate('createdBy').populate('tags').exec(async (err, res) => {

                if (err) {
                    return reject(err)
                }

                const likeCount = await Like.count({referenceId: goalId})

                res['likeCount'] = likeCount;

                return resolve(res);
            });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function getAllGoals(_, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Goal.find({status: 'Published'}).populate('createdBy').populate('tags').exec((err, res) => {

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

async function updateGoal(_, { goal }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            if (goal.tags && goal.tags.length) {
                goal.tags = await helper.insertManyIntoTags(goal.tags);
            }


            await Goal.findByIdAndUpdate(goal._id, goal, {new: true}, (err, res) => {
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

async function deleteGoal(_, { goalId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Goal.deleteOne({_id: goalId}, ((err, res) => {

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
    addGoal,
    getGoalsByUserId,
    getGoalById,
    getAllGoals,
    updateGoal,
    deleteGoal
}