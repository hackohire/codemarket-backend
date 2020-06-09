const graphQlCampaignSchema = `
    
    type Campaign {
        _id: String
        label: String
        name: String
        companies: [Company]
        createdBy: User
        subject: String
        descriptionHTML: String
        from: String
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
    
    type csvData {
        data: JSON
        createdBy: String
        fileName: String
        label: String
        companies: batchData
        batchId: String
    }

    input csvInputData {
        data: JSON
    }

    type getEmailData {
        batches: batchData
        emailTemplate: String
        subject: String
        createdBy: String
        from: String
        companies: batchData
    }

    type batchData {
        _id: ID
        name: String
        campaignId: String
    }

    input batchInput {
        _id: ID
        name: String
        campaignId: String
    }

    type mailingList {
        _id: ID
        name: String
        createdBy: User
    }

    type emailContact {
        _id: ID
        email: String
        status: String
    }

    type Contact {
        _id: ID
        createdBy: User
        batchId: String
        campaignId: String
        status: String
        isEmailSend: Boolean
        phone: [String]
        email: [emailContact]
        proposalName: String
        OrganizationName: String
        birthDate: String
        address: String
        website: String
        companyName: String
        url: String
        firstName: String
        lastName: String
        cityName: String
        name: String
        followers: String
        following: String
        posts: String
        instaProfileId: String
        batch: String
        descriptionHTML: String
        companyContactEmail: String
        conpanyContactPerson: String
        ownerName: String

    }

    type getMailingListContactResponse {
        contacts: [Contact]
        total: Int
    }

    type CampaignData {
        _id: ID
        name: String
        batchId: String
        label: String
        createdAt: String
        updatedAt: String
    }

    type getCampaignDataResponse {
        campaigns: [CampaignData]
        total: Int
    }

    extend type Query {
        getCampaignsWithTracking(pageOptions: PageOptionsInput, companyId: String, batchId: String): [Campaign]
        getCampaignEmails(pageOptions: PageOptionsInput, campaignId: String): getEmailResponse
        getMailingList(companyId: String) : [mailingList]
        getMailingListContacts(pageOptions: PageOptionsInput, batchId: String) : getMailingListContactResponse
        getCampaignData(pageOptions: PageOptionsInput, companyId: String): getCampaignDataResponse
    }

    extend type Mutation {
        saveCsvFileData(data: [JSON], createdBy: String, fileName: String, label: String, companies: batchInput): csvData
        getCsvFileData(data: [JSON], createdBy: String, fileName: String, label: String, companies: batchInput): csvData
        getEmailData(batches: batchInput, emailTemplate: String, subject: String, createdBy: String, from: String, companies: batchInput): getEmailData
    }
`;

module.exports = graphQlCampaignSchema;
