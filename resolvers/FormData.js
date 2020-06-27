const connectToMongoDB = require('../helpers/db');
var ObjectID = require('mongodb').ObjectID;
const helper = require('../helpers/helper');
const FormData = require('./../models/FormData')();
const HomeBuyerProgram = require('./../models/homeBuyerProgram')();


let conn;

async function addformData(_, { formData }, { headers }) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB(process.env.MONGODB_PROD_URL);
            let formDataObj;

            /** This will convert quote object into the mongoose quote model */
            const int = new FormData(formData);

            /** Here we save the quote document into the database */
            await int.save(formData).then(async (p) => {
                conn = await connectToMongoDB(process.env.MONGODB_URL);
                return resolve(p);
            });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function fetchformData(_,{formname}) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB();

            /** Find the tweets created by the user */
            let condition = {'formname': formname}
            const formDataList = await FormData.find(condition).exec();
            console.log(formDataList)
            return resolve(formDataList);
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function fetchFormDataByFormId(_,{ formId, fetchPrograms }) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB();
            const formData = await FormData.findOne({_id: formId}).exec();

            if (fetchPrograms) {
                const programs = await HomeBuyerProgram.find({location: formData.formDataJson.inANeighborhoodCityOrCountyGeneralAreaStartTypingForAMenuOfOptions.value}).exec();
                if(programs) {
                    formData['formDataJson']['programs'] = programs;
                }
            }
            return resolve(formData);
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}


async function fetchformDataById(_,{formDataId}) {
    return new Promise(async (resolve, reject) => {
        try {
            conn = await connectToMongoDB(process.env.MONGODB_PROD_URL);
            let condition = {'_id': formDataId}
            const formDataList = await FormData.find(condition).exec();
            conn = await connectToMongoDB(process.env.MONGODB_URL);
            return resolve(formDataList);
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function fetchSavedDataByFormStructure(_, { pageOptions, formStructureId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            conn = await connectToMongoDB(process.env.MONGODB_PROD_URL);
            
            const sortField = pageOptions.sort && pageOptions.sort.field ? pageOptions.sort.field : 'updatedAt';
            let sort = { [sortField]: pageOptions.sort && pageOptions.sort.order ? parseInt(pageOptions.sort.order) : -1 };
            
            const result = await FormData.aggregate([
                {
                    $match: { commonFormId: ObjectID(formStructureId)}
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'createdBy',
                        foreignField: '_id',
                        as: 'createdBy'
                    }
                },
                {
                    $unwind: {
                        "path": "$createdBy"
                    }
                },
                {
                    $facet: {
                        data: [
                            { $sort: sort },
                            { $skip: (pageOptions.limit * pageOptions.pageNumber) - pageOptions.limit },
                            { $limit: pageOptions.limit },
                        ],
                        pageInfo: [
                            { $group: { _id: null, count: { $sum: 1 } } },
                        ],
                    },
                },
            ]);
            
            conn = await connectToMongoDB(process.env.MONGODB_URL);

            return await resolve(
                {
                    data: result && result.length ? result[0].data : [],
                    total: result && result.length && result[0].pageInfo && result[0].pageInfo.length ? result[0].pageInfo[0].count : 0
                });
        } catch (err) {
            console.log("Catch Err ==> ", err);
            reject(false);
        }
    });
}

async function getMySurveyData(_, { pageOptions, id }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB(process.env.MONGODB_PROD_URL);
            } else {
                console.log('Using existing mongoose connection.');
            }
            
            const sortField = pageOptions.sort && pageOptions.sort.field ? pageOptions.sort.field : 'updatedAt';
            let sort = { [sortField]: pageOptions.sort && pageOptions.sort.order ? parseInt(pageOptions.sort.order) : -1 };

            const result = await FormData.aggregate([
                {
                    $match: { createdBy: ObjectID(id), $or: [{formDataId: null}, {formDataId: {$exists: false}}]}
                },
                {
                    $lookup: {
                        from: 'formdatas',
                        localField: '_id',
                        foreignField: 'formDataId',
                        as: 'connectedFormData'
                    }
                },
                {
                    $unwind: {
                        "path": "$connectedFormData",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $lookup: {
                        from: 'form-structures',
                        localField: 'commonFormId',
                        foreignField: 'commonId',
                        as: 'pFormJson'
                    }
                },
                {
                    $unwind: {
                        "path": "$pFormJson",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $lookup: {
                        from: 'form-structures',
                        localField: 'connectedFormData.commonFormId',
                        foreignField: 'commonId',
                        as: 'cFormJson',
                    }
                },
                {
                    $unwind: {
                        "path": "$cFormJson",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'createdBy',
                        foreignField: '_id',
                        as: 'createdBy'
                    }
                },
                {
                    $unwind: {
                        "path": "$createdBy",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $facet: {
                        data: [
                            { $sort: sort },
                            { $skip: (pageOptions.limit * pageOptions.pageNumber) - pageOptions.limit },
                            { $limit: pageOptions.limit },
                        ],
                        pageInfo: [
                            { $group: { _id: null, count: { $sum: 1 } } },
                        ],
                    },
                },
            ]);

            conn = await connectToMongoDB(process.env.MONGODB_URL);
            return await resolve(
                {
                    data: result && result.length ? result[0].data : [],
                    total: result && result.length && result[0].pageInfo && result[0].pageInfo.length ? result[0].pageInfo[0].count : 0
                });
        } catch (err) {
            console.log("Catch Err getMySurveyData ==>", err);
            reject(err);
        }
    });
}

async function fetchSurveyAndSummaryFormDataById(_, { id }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB(process.env.MONGODB_PROD_URL);
            } else {
                console.log('Using existing mongoose connection.');
            }
    
            const result = await FormData.aggregate([
                {
                    $match: { _id: ObjectID(id) }
                },
                {
                    $lookup: {
                        from: 'formdatas',
                        localField: '_id',
                        foreignField: 'formDataId',
                        as: 'connectedFormData'
                    }
                },
                {
                    $unwind: {
                        "path": "$connectedFormData",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $lookup: {
                        from: 'form-structures',
                        localField: 'commonFormId',
                        foreignField: 'commonId',
                        as: 'pFormJson'
                    }
                },
                {
                    $unwind: {
                        "path": "$pFormJson",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $lookup: {
                        from: 'form-structures',
                        localField: 'connectedFormData.commonFormId',
                        foreignField: 'commonId',
                        as: 'cFormJson'
                    }
                },
                {
                    $unwind: {
                        "path": "$cFormJson",
                        "preserveNullAndEmptyArrays": true
                    }
                }
            ]);
    
            conn = await connectToMongoDB(process.env.MONGODB_URL);
            return await resolve(result[0]);

        } catch (err) {
            console.log("Err in fetchSurveyAndSummaryFormDataById ==> ", err);
            reject(err);
        }
    });
}

module.exports = {
    addformData,
    fetchformData,
    fetchformDataById,
    fetchFormDataByFormId,
    fetchSavedDataByFormStructure,
    fetchSurveyAndSummaryFormDataById,
    getMySurveyData
}