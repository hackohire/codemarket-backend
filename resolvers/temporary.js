const AddSurveyUser = require('./../models/temporary')();
const User = require('../models/user')();
const connectToMongoDB = require('../helpers/db');
const { CognitoIdentityServiceProvider } = require('aws-sdk');
var ObjectID = require('mongodb').ObjectID;
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
let conn;

const { AWS_COGNITO_USERPOOL_ID } = process.env;
const { AWS_COGNITO_CLIENT_ID } = process.env;

async function addSurveyUser(_, { addSurveyUserObj }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            addSurveyUserObj.name = addSurveyUserObj.firstName + " " + addSurveyUserObj.lastName;
            addSurveyUserObj.roles = ['User'];
            // const int = await new User(addSurveyUserObj);

            const userData = await User.findOneAndUpdate({ email: addSurveyUserObj.email}, {$setOnInsert: addSurveyUserObj}, { upsert: true, new : true });

            console.log("This is userData ==> ", userData);
            /** Save the form in the database */
            // await int.save(addSurveyUserObj).then(async (p) => {

                /** Create a user in cognito and send the temporary password to the email */
            var params = {
                UserPoolId: AWS_COGNITO_USERPOOL_ID, /* required */
                Username: addSurveyUserObj.email, /* required */
                DesiredDeliveryMediums: [
                  'EMAIL',
                  /* more items */
                ],
                ForceAliasCreation: true,
                // MessageAction: 'SUPPRESS',
                TemporaryPassword: (ObjectID()).toString(),
                UserAttributes: [
                  {
                    Name: 'name', /* required */
                    Value: addSurveyUserObj.firstName + addSurveyUserObj.lastName ? ` ${addSurveyUserObj.lastName}` : ''
                  },
                  {
                    Name: 'email',
                    Value: addSurveyUserObj.email
                  },
                  {
                    Name: 'email_verified',
                    Value: 'false'
                  }
                  /* more items */
                ],
              };
              new CognitoIdentityServiceProvider().adminCreateUser(params, function(err, data) {
                  console.log(params)
                if (err) {
                    console.log(err, err.stack); // an error occurred
                    userData.email = null;
                    resolve(userData);
                }
                else {
                    console.log(data);
                    resolve(userData);   
                }
              });

            // });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

module.exports = {
    addSurveyUser,
}