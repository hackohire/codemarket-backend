const Twit = require("twit");
const connectToMongoDB = require('../helpers/db');
const Company = require('../models/company')();
const Post = require('../models/post')();
const SocialMediaModel = require('../models/post')();
const helper = require('../helpers/helper');
var array = require('lodash/array');
const auth = require('../helpers/auth');
const socialMedia = require('../helpers/socialMedia');
const { reject } = require('lodash');
let conn;


var T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMAR_SECRET_KEY,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_SECRET_TOKEN,
  timeout_ms: 60 * 1000,
  strictSSL: true,
});

async function addCompany(_, { company }, { headers, db, event }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const int = await new Company(company);

            var regExp = new RegExp("^" + company.name + "$", 'gi');

            const checkIfExists = await Company.find({ name: { $regex: regExp } }).populate('createdBy').populate('cities').exec();

            // const checkIfExists = await Company.find({ $text: { $search: company.name } }).populate('createdBy').populate('cities').exec();

            if (checkIfExists.length) {
                console.log(checkIfExists);
                throw new Error('AlreadyExists');
            } else {
                await int.save(company).then(async (p) => {
                    console.log(p);

                    const filePath = basePath + 'email-template/common-template';

                    let authUser = await auth.auth(event.headers);

                    /** Creating dynamic varibales such as link, subject and email content */
                    const payLoad = {
                        NAME: authUser.name,
                        CONTENT: ` You have successful create your business page "${company.name}". And we look forward to help you expand & grow your business.`,
                        LINK: `${process.env.FRONT_END_URL}company/${p._id}?view="home"`,
                        SUBJECT: 'Business Page Created!'
                    };

                    /** Sending the email */
                    await helper.sendEmail({ to: [authUser.email] }, filePath, payLoad);

                    p.populate('createdBy owners').populate('cities').execPopulate().then(async populatedCompany => {
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

            let updatedCompany;

            const checkIfExists = await Company.find({ $text: { $search: company.name } }).populate('createdBy owners').populate('cities').exec();

            if (checkIfExists.length && checkIfExists[0].id !== company._id) {
                console.log(checkIfExists);
                throw new Error('AlreadyExists');
            } else {
                updatedCompany = await Company.findByIdAndUpdate(company._id, company, { new: true }).populate('createdBy owners cities').exec();
            }

            return resolve(updatedCompany);

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

            Company.find({ 'createdBy': userId, type: companyType ? companyType : { $ne: null } }).populate('createdBy owners').populate('cities').exec((err, res) => {

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

async function getCompanyById(_, { slug }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            Company.find({ slug: slug }).populate('createdBy owners').populate('cities').exec(async (err, res) => {

                if (err) {
                    return reject(err)
                }
                // const likeCount = await Like.count({ referenceId: companyId })

                return resolve(res[0]);
            });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function getCompaniesByType(_, { companyType, pageOptions }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const sortField = pageOptions.sort && pageOptions.sort.field ? pageOptions.sort.field : 'createdAt';
            let sort = { [sortField]: pageOptions.sort && pageOptions.sort.order ? pageOptions.sort.order : 'desc' };

            let condition = { type: companyType ? companyType : { $regex: /^$|\w/ } };

            let total = await Company.countDocuments(condition).exec()

            const companies = await Company.find(condition).populate('createdBy owners').populate('cities')
                .skip((pageOptions.limit * pageOptions.pageNumber) - pageOptions.limit)
                .limit(pageOptions.limit ? pageOptions.limit : total ? total : 1)
                .exec();

            return resolve({ companies, total });

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

/** Lambda to fetch the events for company details page */
async function getEventsByCompanyId(_, { companyId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            let events = await Post.find({ type: 'event', company: companyId }).populate('createdBy').exec();

            return resolve(events);

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

async function createTwitterPost(_, { content }, { headers, db, decodedToken }) {
    return new Promise (async (resolve, reject) => {
        try {
            console.log(content)
            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }
            // Save Content into our DB
            // const socialMedia = new SocialMediaModel(socialMediaPost);
            // await socialMedia.save();
            T.post("statuses/update", { status: content }, function (err, data, res) {
                if (err) {
                  // Dispaly Error from twitter API
                  console.log(err);
                  return reject(err);
                }
                console.log("----", content, T);
                console.log("-----", data, res);
                return resolve({content: "Hello"});
                // return data;
              });
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
    getListOfUsersInACompany,
    getEventsByCompanyId,
    createTwitterPost
}