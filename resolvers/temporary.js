const HelpGrowBusiness = require('./../models/temporary')();
const connectToMongoDB = require('../helpers/db');
const { CognitoIdentityServiceProvider } = require('aws-sdk');
var ObjectID = require('mongodb').ObjectID;
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
let conn;

const { AWS_COGNITO_USERPOOL_ID } = process.env;
const { AWS_COGNITO_CLIENT_ID } = process.env;

async function addHelpGrowBusiness(_, { helpGrowBusinessObject }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const int = await new HelpGrowBusiness(helpGrowBusinessObject);

            /** Save the form in the database */
            await int.save(helpGrowBusinessObject).then(async (p) => {

                /** Create a user in cognito and send the temporary password to the email */
                var params = {
                    UserPoolId: AWS_COGNITO_USERPOOL_ID, /* required */
                    Username: helpGrowBusinessObject.email, /* required */
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
                        Value: helpGrowBusinessObject.firstName + helpGrowBusinessObject.lastName ? ` ${helpGrowBusinessObject.lastName}` : ''
                      },
                      {
                        Name: 'email',
                        Value: helpGrowBusinessObject.email
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
                        p.email = null;
                        resolve(p);
                    }
                    else {
                        console.log(data);
                        resolve(p);   
                    }
                  });

            });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

module.exports = {
    addHelpGrowBusiness,
}