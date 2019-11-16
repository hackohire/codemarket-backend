const connectToMongoDB = require('../helpers/db');
const QuestionAndAnswer = require('./../models/q&a')();
let conn;

async function addQuestionOrAnswer(_, { questionOrAnswer }, { headers, db, decodedToken, context }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const c = new QuestionAndAnswer(questionOrAnswer);

            if (c.isQuestion) {
                await c.save().then( async (q) => {
                    console.log(q);
                    await q.populate('createdBy').populate('questionId').execPopulate();
                    resolve(q);
                });
            } else if (c.isAnswer || c.questionId) {

                await c.save().then( async (ans) => {
                    console.log(ans);
                    await QuestionAndAnswer.findOneAndUpdate({_id: ans.questionId, 'isQuestion': true}, {$push: {answers: ans._id}}).exec();
                    await ans.populate('createdBy').populate('questionId').execPopulate();
                    resolve(ans);
                });
            }
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function getQuestionAndAnswersByReferenceId(_, { referenceId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            let questioAndAnswers = await QuestionAndAnswer.find({referenceId: referenceId, isQuestion: true, status: { $ne: 'Deleted' }})
            .populate('createdBy')
            .populate({ path: 'answers', match: { status: { $ne: 'Deleted' }, isAnswer: true}, populate: {path: 'createdBy'}}).exec();

            resolve(questioAndAnswers);


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function deleteQuestionOrAnswer(_, { questionOrAnswerId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }


            let c = await QuestionAndAnswer.findByIdAndUpdate(questionOrAnswerId, { status: 'Deleted' }).exec();

            return resolve(c._id);
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}


async function updateQuestionOrAnswer(_, { questionOrAnswerId, text }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }


            let c = await QuestionAndAnswer.findByIdAndUpdate(questionOrAnswerId, { text: text }, { new: true }).exec();

            return resolve(c);
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

module.exports = {
    addQuestionOrAnswer,
    getQuestionAndAnswersByReferenceId,
    deleteQuestionOrAnswer,
    updateQuestionOrAnswer
}