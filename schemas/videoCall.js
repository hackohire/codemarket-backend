const graphQlVideoCallSchema = `
    
type twilioVideoToken {
    token: String
    identity: String
}

extend type Query {
    createVideoToken(identity: String): twilioVideoToken
}
`
module.exports = graphQlVideoCallSchema;
