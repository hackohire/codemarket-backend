const connectToMongoDB = require('../helpers/db');
const FormData = require('./../models/FormData')(); /** Impoer Tweet mongoose model */
const FormJson = require('./../models/FormJson')();
var ObjectID = require('mongodb').ObjectID;

let conn;

async function addformData(_, { formData }, { headers }) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB();

            /** This will convert quote object into the mongoose quote model */
            const int = new FormData(formData);

            /** Here we save the quote document into the database */
            await int.save(formData).then(async (p) => {
                console.log(p)
                resolve(p);
            });
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function fetchformData(_,{pageOptions, formId }) {
    return new Promise(async (resolve, reject) => {
        try {

            const actualForm = await FormJson.findOne({ _id: formId }).populate('connectedDB').exec();

            const sortField = pageOptions.sort && pageOptions.sort.field ? pageOptions.sort.field : 'updatedAt';
            let sort = { [sortField]: pageOptions.sort && pageOptions.sort.order ? parseInt(pageOptions.sort.order) : -1 };

            let formDataList;
            if (actualForm && actualForm.connectedDB && actualForm.connectedDB.mongoUrl) {
                conn = await connectToMongoDB(actualForm.connectedDB.mongoUrl);

                // formDataList = await FormData.find({ connectedFormStructureId: formId }).exec();

                const result = await FormData.aggregate([
                    {
                        $match: { connectedFormStructureId: ObjectID(formId)}
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
                
                return await resolve(
                    {
                        data: result && result.length ? result[0].data : [],
                        total: result && result.length && result[0].pageInfo && result[0].pageInfo.length ? result[0].pageInfo[0].count : 0
                    });
            } else {
                conn = await connectToMongoDB();

                formDataList = await FormData.find({ connectedFormStructureId: formId }).exec();
                return resolve(formDataList);
            }
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function fetchFormDataFromAnotherDB(_, { dbUrl, collection, formId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        const conn = await connectToMongoDB(dbUrl);

        const result = conn.collection('FormData').aggregate([
            {
                $match: { }
            }
        ]).toArray();
    });
}

async function fetchSavedDataByFormStructure(_, { pageOptions, formStructureId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            conn = await connectToMongoDB();
            
            const sortField = pageOptions.sort && pageOptions.sort.field ? pageOptions.sort.field : 'updatedAt';
            let sort = { [sortField]: pageOptions.sort && pageOptions.sort.order ? parseInt(pageOptions.sort.order) : -1 };
            
            const result = await FormData.aggregate([
                {
                    $match: { connectedFormStructureId: ObjectID(formStructureId)}
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

async function fetchSurveyAndSummaryFormDataById(_, { id }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
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
                        "path": "$connectedFormData"
                    }
                },
                {
                    $lookup: {
                        from: 'form-structures',
                        localField: 'connectedFormStructureId',
                        foreignField: '_id',
                        as: 'pFormJson'
                    }
                },
                {
                    $unwind: {
                        "path": "$pFormJson"
                    }
                },
                {
                    $lookup: {
                        from: 'form-structures',
                        localField: 'connectedFormData.connectedFormStructureId',
                        foreignField: '_id',
                        as: 'cFormJson'
                    }
                },
                {
                    $unwind: {
                        "path": "$cFormJson"
                    }
                }
            ]);
    
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
    fetchFormDataFromAnotherDB,
    fetchSavedDataByFormStructure,
    fetchSurveyAndSummaryFormDataById
}