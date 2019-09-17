const connectToMongoDB = require('../helpers/db');
const Interview = require('../models/interview')();
const helper = require('../helpers/helper');
const Like = require('./../models/like')();
const Product = require('./../models/product')();
const HelpRequest = require('./../models/help')();
const Requirement = require('./../models/requirement')();
const Howtodoc = require('./../models/how-to-doc')();
const Design = require('./../models/design')();
const Testing = require('./../models/Testing')();
let conn;



async function getAllPosts(_, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            /** Taking Empty Posts array */
            let posts = [];

            /** Fetching all the Published Products */
            posts = await Product.find({status: 'Published'}).populate('createdBy').populate('tags').exec();

            /** Fetching all the Published help-requests and concating it with posts */
            const helpRequets = await HelpRequest.find({status: 'Published'}).populate('createdBy').populate('tags').exec();
            posts = posts.concat(helpRequets);

            /** Fetching all the Published interviews and concating it with posts */
            const interviews = await Interview.find({status: 'Published'}).populate('createdBy').populate('tags').exec();
            posts = posts.concat(interviews);

            /** Fetching all the Published requirement and concating it with posts */
            const requirements = await Requirement.find({status: 'Published'}).populate('createdBy').populate('tags').exec();
            posts = posts.concat(requirements);

            /** Fetching all the Published how-to-doc and concating it with posts */
            const howtodocs = await Howtodoc.find({status: 'Published'}).populate('createdBy').populate('tags').exec();
            posts = posts.concat(howtodocs);

            /** Fetching all the Published testing and concating it with posts */
            const testings = await Testing.find({status: 'Published'}).populate('createdBy').populate('tags').exec();
            posts = posts.concat(testings);

            /** Fetching all the Published designs and concating it with posts */
            const designs = await Design.find({status: 'Published'}).populate('createdBy').populate('tags').exec();
            posts = posts.concat(designs);

            /** Resolving Promise with all the Published posts in the platform */
            return resolve(posts);



        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}



module.exports = {
    getAllPosts,
}