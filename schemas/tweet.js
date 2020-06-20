const tweetSchema = `
    type Tweet {
        _id: ID!
        id: String
        status: String
        createdBy: User
        tweetDesc: String
    }
    
    input TweetInput {
        _id: ID
        id: String
        status: String
        createdBy: String
        tweetDesc: String
    }

    extend type Query {
        fetchTweets(userId: String): [Tweet]
    }

    extend type Mutation {
        tweet(tweet: TweetInput): Tweet
    }
`;
module.exports = tweetSchema; 