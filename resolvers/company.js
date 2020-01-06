const connectToMongoDB = require('../helpers/db');
const Company = require('../models/company')();
const Post = require('../models/post')();
const helper = require('../helpers/helper');
const Like = require('./../models/like')();
var array = require('lodash/array');
const { pubSub } = require('../helpers/pubsub');
let conn;

async function addCompany(_, { company }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            if (company.cities && company.cities.length) {
                company.cities = await helper.insertManyIntoCities(company.cities);
            }


            const int = await new Company(company);

            const checkIfExists = await Company.find({ $text: { $search: company.name } }).populate('createdBy').populate('cities').exec();

            if (checkIfExists.length) {
                console.log(checkIfExists);
                throw new Error('AlreadyExists');
            } else {
                await int.save(company).then(async (p) => {
                    console.log(p)

                    p.populate('createdBy').populate('cities').execPopulate().then(async populatedCompany => {
                        // await helper.sendCompanyCreationEmail(populatedCompany, populatedCompany.type === 'product' ? 'Bugfix' : '');
                        resolve(populatedCompany);
                    });

                });
            }
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function updateCompany(_, { company, updateOperation }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const checkIfExists = await Company.find({ $text: { $search: company.name } }).populate('createdBy').populate('cities').exec();

            if (checkIfExists.length && checkIfExists[0].id !== company._id) {
                console.log(checkIfExists);
                throw new Error('AlreadyExists');
            } else {
                let updatedCompany;
                if (updateOperation && updateOperation.operation) {
                    let mongooseOperationDoc = {};

                    switch (updateOperation.operation) {
                        case 'ADD':
                            mongooseOperationDoc = {
                                $push: {
                                    [updateOperation.field]: {
                                        $each: [updateOperation[updateOperation.field]],
                                        $position: 0
                                    }
                                }
                            }
                            updatedCompany = await Company.findByIdAndUpdate(company._id, mongooseOperationDoc, { new: true }).populate('createdBy cities').exec();
                            break;
                        case 'DELETE':
                            mongooseOperationDoc = {
                                $pull: {
                                    [updateOperation.field]: {
                                        _id: updateOperation[updateOperation.field]._id
                                    }
                                }
                            }
                            updatedCompany = await Company.findByIdAndUpdate(company._id, mongooseOperationDoc, { new: true }).populate('createdBy cities').exec();
                            break;

                        case 'UPDATE': {
                            mongooseOperationDoc = {
                                $set: {
                                    [`${updateOperation.field}.$[elem].description`]: updateOperation[updateOperation.field].description
                                }
                            }
                            const arrayFilters =  [
                                    {
                                        'elem._id': updateOperation[updateOperation.field]._id
                                    }
                                ]
                            
                            updatedCompany = await Company.findByIdAndUpdate(company._id, mongooseOperationDoc, {arrayFilters, new: true }).populate('createdBy cities').exec();
                            break;
                        }
                    }
                } else {
                    if (company.cities && company.cities.length) {
                        company.cities = await helper.insertManyIntoCities(company.cities);
                    }
                    updatedCompany = await Company.findByIdAndUpdate(company._id, company, { new: true }).populate('createdBy cities').execPopulate();
                }
                await pubSub.publish('COMPANY_UPDATED', updatedCompany);
                return resolve(updatedCompany);
            }

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function getCompaniesByUserIdAndType(_, { userId, companyType }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Company.find({ 'createdBy': userId, type: companyType ? companyType : { $ne: null } }).populate('createdBy').populate('cities').exec((err, res) => {

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

async function getCompanyById(_, { companyId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Company.findById(companyId).populate('createdBy').populate('cities').exec(async (err, res) => {

                if (err) {
                    return reject(err)
                }

                const likeCount = await Like.count({ referenceId: companyId })

                res['likeCount'] = likeCount;

                return resolve(res);
            });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function getCompaniesByType(_, { companyType }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Company.find({ type: companyType ? companyType : { $ne: null } }).populate('createdBy').populate('cities').exec((err, res) => {

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



async function deleteCompany(_, { companyId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Company.deleteOne({ _id: companyId }, ((err, res) => {

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

/** This Lambda Function is to fetch the list of users, who has selected the company while creating the dreamjob */

async function getListOfUsersInACompany(_, { companyId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            let users = await Post.find({ type: 'dream-job', company: companyId }).populate('createdBy').exec();

            users = users && users.length ? users.map(u => u.createdBy) : [];
            users = array.uniqBy(users, 'id')

            return resolve(users);


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}








module.exports = {

    addCompany,
    updateCompany,

    getCompaniesByUserIdAndType,
    getCompanyById,
    getCompaniesByType,
    deleteCompany,
    getListOfUsersInACompany
}