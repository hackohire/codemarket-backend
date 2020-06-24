const tweetSchema = `
    type Tweet {
        _id: ID!
        id: String
        status: String
        createdBy: User
        tweetDesc: String
        createdAt: String
    }
    
    input TweetInput {
        _id: ID
        id: String
        status: String
        createdBy: String
        tweetDesc: String
        createdAt: String
    }

    extend type Query {
        fetchTweets(userId: String): [Tweet]
    }

    extend type Mutation {
        tweet(tweet: TweetInput): Tweet
        
    }


`;
module.exports = tweetSchema; 
