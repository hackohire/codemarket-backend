const graphQlAddSurveyUserSchema = `
type AddSurveyUsers {
    _id: ID
    businessName: String
    website: String
    firstName: String
    lastName: String
    mobileNumber: Float
    businessAreas: [Tag]
    email: String
    city: String
    alreadyExist: Boolean
  }
  
  input AddSurveyUserInput {
    _id: ID
    businessName: String
    website: String
    firstName: String
    lastName: String
    mobileNumber: Float
    businessAreas: [TagInput]
    email: String
    city: String
    alreadyExist: Boolean
  }

  extend type Mutation {
    addSurveyUser(addSurveyUserObj: AddSurveyUserInput): AddSurveyUsers
  }
`

module.exports = graphQlAddSurveyUserSchema;

