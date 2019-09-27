const AWS = require('aws-sdk');
const connectToDB = require('./helpers/db');
const util = require('util');
const { sendMessageToWebsocketClient } = require("./helpers/helper");

module.exports.socketConnectionHandler = async (event, context) => {
    return new Promise(async (resolve, reject) => {
        try {
            const connectionId = event.requestContext.connectionId
            let conn = await connectToDB();

            let isConnected;

            if (event.requestContext.eventType === 'CONNECT') {
                isConnected = true;
                // console.log(insetedConnection);

            } else if (event.requestContext.eventType === 'DISCONNECT') {
                const deleted = await conn.collection('connections').findOneAndDelete({ connectionId: connectionId});
                isConnected = false;
                console.log(deleted);
            }

            await sendMessageToWebsocketClient(event, connectionId, { isConnected }, conn);

            return resolve({
                statusCode: 200,
                body: JSON.stringify({
                    message: event
                })
            });
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    })
}

module.exports.onOffer = async (event, context) => {
    return new Promise(async (resolve, reject) => {
        try {

            let conn = await connectToDB();
            let connectionData;
            const postData = JSON.parse(event.body).message;

            try {

                connectionData = await conn.collection('connections').find({userId: { $ne: postData.sender }}).toArray();

                if (connectionData && connectionData.length) {
                    connectionData.forEach(async (c) => {
                        await sendMessageToWebsocketClient(event, c.connectionId, postData, conn);
                    })
                }
            } catch (e) {
                return { statusCode: 500, body: e.stack };
            }

            console.log(event.requestContext);
            return resolve({
                statusCode: 200,
                body: JSON.stringify({
                    message: event
                })
            });
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    })
}


module.exports.setUserOnline = async (event, context) => {
    return new Promise(async (resolve, reject) => {
        try {

            const userId = JSON.parse(event.body).userId;
            const connectionId = event.requestContext.connectionId
            let conn = await connectToDB();

            const insetedUserId = await conn.collection('connections').insertOne({ connectionId: connectionId, userId: userId})

            await sendMessageToWebsocketClient(event, connectionId, {isUserOnline: insetedUserId ? true : false}, conn);

            return resolve({
                statusCode: 200,
                body: JSON.stringify({
                    message: insetedUserId
                })
            });
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    })
}

module.exports.calling = async (event, context) => {
    return new Promise(async (resolve, reject) => {
        try {
            const userId = JSON.parse(event.body).userId;
            const connectionId = event.requestContext.connectionId
            let conn = await connectToDB();

            const userWhoIsCalling = await conn.collection('connections').findOne({ userId: { $eq: userId}});

            if (userWhoIsCalling) {
                await sendMessageToWebsocketClient(event, userWhoIsCalling.connectionId, {userWhoIsCalling}, conn);
            }

            return resolve({
                statusCode: 200,
                body: JSON.stringify({
                    message: userWhoIsCalling
                })
            });
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    })
}