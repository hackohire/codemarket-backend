const { PubSub, DynamoDBEventStore } = require('aws-lambda-graphql');
const AWS = require('aws-sdk');

AWS.config.update({
  secretAccessKey: process.env.AWS_SECRETKEY,
  accessKeyId: process.env.AWS_ACCESSKEY_ID,
  region: 'us-east-1'
});

// serverless offline support
const dynamoDbClient = new AWS.DynamoDB.DocumentClient({
    ...(process.env.IS_OFFLINE
      ? {
          endpoint: 'http://localhost:8000',
        }
      : {}),
  });
  
  const eventStore = new DynamoDBEventStore({ dynamoDbClient, eventsTable: process.env.EVENTS });
  const pubSub = new PubSub({ eventStore });

module.exports.pubSub = pubSub;