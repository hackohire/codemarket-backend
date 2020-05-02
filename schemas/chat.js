const graphQlChatSchema = `
    
type twilioToken {
    token: String
    identity: String
}

extend type Query {
    createdToken(identity: String): twilioToken
}
`
module.exports = graphQlChatSchema;
