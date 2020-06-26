const Twit = require("twit");

var T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMAR_SECRET_KEY,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_SECRET_TOKEN,
  timeout_ms: 60 * 1000,
  strictSSL: true,
});

const twitter = {};

twitter.createTwitterPost = (content) => {
  console.log(content);
  T.post("statuses/update", { status: content }, function (err, data, res) {
    if (err) {
      // Dispaly Error from twitter API
      console.log(err);
      return
    }
    return data;
  });
};

module.exports = twitter;
