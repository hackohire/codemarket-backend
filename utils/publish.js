const {postMessage} = require('../models/topic');

const publish = (topic, data) => {
	return postMessage(topic, data);
}

module.exports = publish;
