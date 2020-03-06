
const { gql } = require('apollo-server-lambda');

const tweetSchema = `
    type Tweet {
        _id: ID!
        id: String
        status: String
        createdBy: User
        description: [descriptionBlocks]
    }
    
    input TweetInput {
        _id: ID
        id: String
        status: String
        createdBy: ID
        description: [InputdescriptionBlock]
    }

    extend type Query {
        fetchTweets(userId: String): [Tweet]
    }

    extend type Mutation {
        tweet(tweet: TweetInput): Tweet
    }
`;
module.exports = gql(tweetSchema);

