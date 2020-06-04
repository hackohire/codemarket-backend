const twilio = require("twilio");

const AccessToken = twilio.jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;
const VideoGrant = AccessToken.VideoGrant;

const twilioCtrl = {};

twilioCtrl.tokenGenerator = (identity, deviceId) => {
  const appName = "TwilioChat";

  // Create a unique ID for the client on their current device
  const endpointId = appName + ":" + identity + ":" + deviceId;

  // Create a "grant" which enables a client to use Chat as a given user,
  // on a given device
  const chatGrant = new ChatGrant({
    serviceSid: process.env.TWILIO_CHAT_SERVICE_SID,
    endpointId: endpointId,
  });
  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET
  );
  token.addGrant(chatGrant);
  token.identity = identity;
  // Serialize the token to a JWT string and include it in a JSON response.
  let dataResponse = {
    identity: identity,
    token: token.toJwt(),
  };
  return dataResponse;
};

twilioCtrl.tokenGeneratorForVideoCall = (identity) => {
  let uniqueName = identity;

  // Create an access token which we will sign and return to the client,
  // containing the grant we just created.
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET
  );

  // Assign the generated identity to the token.
  token.identity = identity;

  // Grant the access token Twilio Video capabilities.
  let grant = new VideoGrant();
  token.addGrant(grant);

  // Serialize the token to a JWT string and include it in a JSON response.
  let dataResponse = {
    identity: uniqueName,
    token: token.toJwt(),
  };
  return dataResponse;
};

module.exports = twilioCtrl;
