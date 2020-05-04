const graphQlHelpBusinessGrowSchema = `
type HelpGrowYourBusineess {
    _id: ID
    businessName: String
    website: String
    firstName: String
    lastName: String
    mobileNumber: Float
    businessAreas: [Tag]
    email: String
  }
  
  input HelpGrowYourBusineessInput {
    _id: ID
    businessName: String
    website: String
    firstName: String
    lastName: String
    mobileNumber: Float
    businessAreas: [TagInput]
    email: String
  }

  extend type Mutation {
    addHelpGrowBusiness(helpGrowBusinessObject: HelpGrowYourBusineessInput): HelpGrowYourBusineess
  }
`

module.exports = graphQlHelpBusinessGrowSchema;

