const graphQlCampaignSchema = `
    
    type Campaign {
        _id: String
        label: String
        name: String
        companies: [Company]
        createdBy: User
        subject: String
        descriptionHTML: String
        count: Int
        emailData: [Email]
    }

    type TrackingData {
        _id: ID
        label: String
        eventType: String
        mail: Mail
        open: Open
    }

    type Open {
        timestamp: String
        userAgent: String
        ipAddress: String
    }

    type Mail {
        timestamp: String
        source: String
        sendingAccountId: String
        messageId: String
        headersTruncated: Boolean
        commonHeaders: CommonHeaders
        headers: [Headers]
        destination: [String]
      }
    
      
    type CommonHeaders {
        date: String
        messageId: String
        subject: String
        to: [String]
        replyTo: [String]
        from: [String]
    }
      
    type Headers {
        name: String
        value: String
    }

    input CampaignInput {
        _id: String
        name: String
        companies: [CompanyInput]
        createdBy: UserInput
        subject: String
        descriptionHTML: String
    }

    type getEmailResponse {
        emails: [Email]
        total: Int
      }

    extend type Query {
        getCampaignsWithTracking(pageOptions: PageOptionsInput, companyId: String): [Campaign]
        getCampaignEmails(pageOptions: PageOptionsInput, campaignId: String): getEmailResponse
    }

`;

module.exports = graphQlCampaignSchema;
