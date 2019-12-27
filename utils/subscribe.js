const Client = require('../models/client');
const { PubSub } = require('graphql-subscriptions');

const subscribeResolver = topic => async ({ id }, args, { connectionId, ttl }) => {
    await new Client(connectionId).subscribe({
        ttl,
        topic,
        subscriptionId: id
    })
    return new PubSub().asyncIterator([topic]);
}

module.exports = subscribeResolver;
