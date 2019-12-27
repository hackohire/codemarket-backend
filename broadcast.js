const {publishMessage} = require('./models/topic.js');

const publish = async (data, topic) => {
    return await publishMessage(data, topic);
}

module.exports = publish;
