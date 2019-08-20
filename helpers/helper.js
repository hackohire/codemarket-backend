var auth = require('./auth');
const Tag = require('../models/tag')();

async function checkIfUserIsAdmin (decodedToken) {
    const isUserAdmin = new Promise((resolve, reject) => {
        decodedToken.then((res, err) => {
            // console.log(res);
            if(err) reject(err);
            if (res && res['cognito:groups'] && res['cognito:groups'].length) {
                // console.log(res['cognito:groups'].indexOf('Admin'))
                resolve(res['cognito:groups'].indexOf('Admin') > -1);
            }
        });
    });
    return isUserAdmin;
}

async function insertManyIntoTags(tags) {
    console.log(tags);
    const tagsAdded = new Promise((resolve, reject) => {
        Tag.insertMany(tags, {ordered: false, rawResult: true}).then((d) => {
            console.log(d)
            resolve(d.ops.map(id => id._id));
        });
    })
    return tagsAdded;
}

module.exports = {
    checkIfUserIsAdmin,
    insertManyIntoTags
}