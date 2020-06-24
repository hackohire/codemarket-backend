const twitSchema = `
   
type twit{
    content: String
}

input twitInput{
    content: String
}

extend type Mutation {
    createTwitterPost(content: String): twit
}
`;
module.exports = twitSchema;