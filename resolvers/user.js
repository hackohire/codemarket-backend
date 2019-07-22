const connectToMongoDB = require('./../helpers/db');
const auth = require('./../helpers/auth');
const User = require('./../models/user')();

let conn;

async function getUsers(_, { _page = 1, _limit = 10 }, { headers, db, decodedToken }) {
    console.log(decodedToken);
    return new Promise(async (resolve, reject) => {
        try {
            // console.log(headers);
            // await auth.auth(headers);
            console.log(db)
            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const users = await User.find()
                .limit(_limit)
                .skip((_page - 1) * _limit);

            // await db.disconnect();
            return resolve(users);
            
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function createUser(_, { user }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {
            let decodeToken;
            await decodedToken.then((res, err) => {
                console.log(res);
               decodeToken = res; 
            })
            // const decodedToken = await auth.auth(headers);
            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }


            let options = { upsert: true, new: true, setDefaultsOnInsert: true };
            
            await User.findOneAndUpdate({email: user.email}, user, options, async (err, u) => {
                if(err) {
                    return (err);
                }

                if(u) {
                    return resolve(u);
                }

            // await db.disconnect();
                
            });
            
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function updateUser(_, { user }, { headers, db }) {
    return new Promise(async (resolve, reject) => {
        try {
            // await auth(headers);

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            // const userToBeSaved = await new User(user);
            await User.findByIdAndUpdate(user._id, user, {new:true}).then(userCreated => {
                console.log(userCreated)
                return resolve(userCreated);
            });

            // await db.disconnect();
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

module.exports = {
    getUsers,
    createUser,
    updateUser,
};
