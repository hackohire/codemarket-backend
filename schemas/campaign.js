
const { gql } = require('apollo-server-lambda');

const graphQlCampaignSchema = `
    
    type Campaign {
        _id: String
        name: String
        companies: [Company]
    }

    input CampaignInput {
        _id: String
        name: String
        companies: [CompanyInput]
    }

`

module.exports = gql(graphQlCampaignSchema);
