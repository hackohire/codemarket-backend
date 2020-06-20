const connectToMongoDB = require('../helpers/db');
const Tweet = require('./../models/tweet')(); 
/** Impoer Tweet mongoose model */

let conn;

async function tweet(_, { tweet }) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB();
            console.log("Tweet:"+tweet);
            /** This will convert tweet object into the mongoose tweet model */
            const int = new Tweet(tweet);
            /** Here we save the tweet document into the database */
            //await int.save(tweet).populte.then(async (p) => {
            //    p.populate('createdBy').execPopulate().then(async populatedPost => {
            //        resolve(populatedPost);
            //    });
            //});
            await int.save().then(async (tweet) => {
                console.log(tweet);
                await tweet.populate('createdBy').populate('children').execPopulate();
                resolve(tweet);
            })
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

/** Fetch the tweets based on given userId */
async function fetchTweets(_, { userId }) {
    return new Promise(async (resolve, reject) => {
        try {
            /** Connect Database with the mongo db */
            conn = await connectToMongoDB();

            /** Find the tweets created by the user */
            const tweets = await Tweet.find({createdBy: userId}).sort({_id:-1}).populate('createdBy').exec();

            return resolve(tweets);
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

module.exports = {
    tweet,
    fetchTweets
} 