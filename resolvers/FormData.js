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
            conn = await connectToMongoDB();
            let formDataObj;

            /** This will convert quote object into the mongoose quote model */
            const int = new FormData(formData);

            /** Here we save the quote document into the database */
            await int.save(formData).then(async (p) => {
                console.log("This is p == > ", p);
                return resolve(p);

                // console.log(p)

                // const company = await p.populate({path: 'company', populate: {path: 'owners createdBy'}}).execPopulate();
                // formDataObj = p.formDataJson;

                // const filePath = basePath + 'email-template/dpa-email-template';


                // if (company.company.owners.length) {
                //     const ownersEmail = company.company.owners.map(o => o.email);
                //     ownersEmail.push(company.company.createdBy.email);
                    
                //     console.log("ownersEmail ==> ", ownersEmail);
    
    
                //     const payLoadToCompanyOwners = {
                //         FIRSTNAME: `${formDataObj.firstName}`,
                //         LASTNAME: `${formDataObj.lastName}`,
                //         EMAIL: `${formDataObj.email}`,
                //         SELECT: `${formDataObj.select1}`,
                //         SUBJECT: `New Lead Generated`
                //     };
                //     await helper.sendEmail({ to: ownersEmail}, filePath, payLoadToCompanyOwners);
                // }

                
                // const payLoadToSubscriber = {
                //     SUBJECT: `Thanks ${formDataObj.firstName} for subscribing`,
                //     FIRSTNAME: `${formDataObj.firstName}`,
                //     LASTNAME: `${formDataObj.lastName}`,
                //     EMAIL: `${formDataObj.email}`,
                //     SELECT: `${formDataObj.select1}`,
                //     HTML_CONTENT: "<div>Congratulation in taking the first step toward becoming an owner. Whether you’re millennials, first-time, returners to ownership after foreclosure-short-sale and multi-unit buyers whichever may be the case you’re giving serious thought to doing so. Buying can be one of the most exciting experiences you will ever experience but it can also be one of the scariest, since it’s likely to be the biggest financial investment you will ever make. Thank you for allowing us to help you address a few of the biggest hurdles: the down payment and closing cost. Please take your time in reviewing the available options that can be used toward down payment and closing cost. </div> <br/><br/> <div>NEXT STEP To participate in many of the programs mentioned you must complete a buyer education course. Our buyer education course can be found here. During this training not only are you granted access to many programs that you will be unlocking through this portal. In case you were wondering our partners education covers many of the major steps to preparing for buying a home for instance 3 quick steps to building a mortgage-ready credit profile, an insider's guide on how to qualify for a home or multi-unit loan under the best rates and terms available, shop for a home like a pro and get your purchase offer accepted and beat out cash buyers, in addition to a customized buying action plan.</div>"
                // };

                // await helper.sendEmail({ to: [formDataObj.email]}, filePath, payLoadToSubscriber);
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
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB();
            let condition = {'_id': formDataId}
            const formDataList = await FormData.find(condition).exec();
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

async function getMySurveyData(_, { pageOptions, id }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }
            
            const sortField = pageOptions.sort && pageOptions.sort.field ? pageOptions.sort.field : 'updatedAt';
            let sort = { [sortField]: pageOptions.sort && pageOptions.sort.order ? parseInt(pageOptions.sort.order) : -1 };

            const result = await FormData.aggregate([
                {
                    $match: { createdBy: ObjectID(id)}
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
    fetchformDataById,
    fetchFormDataByFormId,
    fetchSavedDataByFormStructure,
    fetchSurveyAndSummaryFormDataById,
    getMySurveyData
}