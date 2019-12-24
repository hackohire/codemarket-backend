const { DynamoDBEventStore, PubSub, } = require('aws-lambda-graphql');
const eventStore = new DynamoDBEventStore();
const pubSub = new PubSub({ eventStore });


module.exports = pubSub;