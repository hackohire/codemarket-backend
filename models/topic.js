const uuid = require('uuid');
const client = require('../utils/dynamodb');
const Client = require('./client');

const getSubscribers = async (topic) => {
    console.log(client)
    const { Items: clients } = await client.query({
        ExpressionAttributeValues: {
            ':topic': topic
        },
        KeyConditionExpression: 'topic = :topic',
        ProjectionExpression: 'connectionId, subscriptionId',
        TableName: process.env.TOPICS_TABLE
    }).promise();
    return clients;
};

module.exports.publishMessage = async (topic, data) => {
    const subscribers = await getSubscribers(topic);
    const promises = subscribers.map(async ({ connectionId, subscriptionId }) => {
        const TopicSubscriber = new Client(connectionId);
        try {
            const res = await TopicSubscriber.sendMessage({
                id: subscriptionId,
                payload: { data },
                type: 'data'
            });
            return res;
        } catch (err) {
            if (err.statusCode === 410) { // this client has disconnected unsubscribe it
                return TopicSubscriber.unsubscribe();
            }
        }
    });
    return Promise.all(promises);
};

const publish = require('../broadcast');
module.exports.postMessage = async (data, topic) => {
    const payload = {
        data,
        topic: topic,
        id: uuid.v4(),
    };
    if (process.env.IS_OFFLINE) { // dynamodb streams are not working offline so invoke lambda directly
        await publish({
            Records: [{
                eventName: 'INSERT',
                dynamodb: {
                    NewImage: payload
                }
            }]
        });
    }
    return await client.put({
        Item: payload,
        TableName: process.env.EVENTS_TABLE
    }).promise();
};

// function Topic(topic) {
//     this.topic = topic;

//     this.getSubscribers = async () => {
//         const { Items: clients } = await client.query({
//             ExpressionAttributeValues: {
//                 ':topic': this.topic
//             },
//             KeyConditionExpression: 'topic = :topic',
//             ProjectionExpression: 'connectionId, subscriptionId',
//             TableName: process.env.TOPICS_TABLE
//         }).promise();
//         return clients;
//     }

//     this.publishMessage = async (data) => {
//         const subscribers = await this.getSubscribers();
//         const promises = subscribers.map(async ({ connectionId, subscriptionId }) => {
//             const TopicSubscriber = new Client(connectionId);
//             try {
//                 const res = await TopicSubscriber.sendMessage({
//                     id: subscriptionId,
//                     payload: { data },
//                     type: 'data'
//                 });
//                 return res;
//             } catch (err) {
//                 if (err.statusCode === 410) {	// this client has disconnected unsubscribe it
//                     return TopicSubscriber.unsubscribe()
//                 }
//             }
//         })
//         return Promise.all(promises);
//     }

//     this.postMessage = async (data) => {
//         const payload = {
//             data,
//             topic: this.topic,
//             id: uuid.v4(),
//         };
//         if (process.env.IS_OFFLINE) { // dynamodb streams are not working offline so invoke lambda directly
//             await publish({
//                 Records: [{
//                     eventName: 'INSERT',
//                     dynamodb: {
//                         NewImage: payload
//                     }
//                 }]
//             });
//         }
//         return client.put({
//             Item: payload,
//             TableName: process.env.EVENTS_TABLE
//         }).promise();
//     }
// }

// module.exports = Topic;