const connectToMongoDB = require('../helpers/db');
const Company = require('../models/company')();
const helper = require('../helpers/helper');
const Like = require('./../models/like')();
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
            
            const checkIfExists = await Company.find({ $text: { $search : company.name }}).populate('createdBy').populate('cities').exec();

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

async function updateCompany(_, { company }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const checkIfExists = await Company.find({ $text: { $search : company.name }}).populate('createdBy').populate('cities').exec();

            if (checkIfExists.length && checkIfExists[0].id !== company._id) {
                console.log(checkIfExists);
                throw new Error('AlreadyExists');
            } else {
                if (company.cities && company.cities.length) {
                    company.cities = await helper.insertManyIntoCities(company.cities);
                }
    
    
                await Company.findByIdAndUpdate(company._id, company, { new: true }, (err, res) => {
                    if (err) {
                        return reject(err)
                    }
    
                    res.populate('createdBy').populate('cities').execPopulate().then((d) => {
                        return resolve(d);
                    });
                });
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

            Company.find({ 'createdBy': userId, type: companyType }).populate('createdBy').populate('cities').exec((err, res) => {

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

            Company.find({ type: companyType }).populate('createdBy').populate('cities').exec((err, res) => {

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

async function getAllCompanies(_, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            /** Taking Empty Companies array */
            let companies = [];

            /** Fetching all the Published Companies */
            companies = await Company.find({}).populate('createdBy').populate('cities')
                .sort({name: 1})
                .exec();

            return await resolve(companies);




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








module.exports = {

    addCompany,
    updateCompany,

    getAllCompanies,
    getCompaniesByUserIdAndType,
    getCompanyById,
    getCompaniesByType,
    deleteCompany,
}