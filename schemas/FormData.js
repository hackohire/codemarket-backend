const formDataSchema = `
type formData {
    _id: ID
    createdAt: String
    updatedAt: String

    formname: String
    formDataJson: JSON
    connectedFormStructureId: ID
    formDataId: String
    company: Company
    createdBy: User
    cFormJson: JSON
    pFormJson: JSON
    connectedFormData: formData
}

input formDataInput {
    _id: ID
    createdAt: String
    updatedAt: String
    formDataId: String
    formname: String
    formDataJson: JSON
    cFormJson: JSON
    pFormJson: JSON
    connectedFormStructureId: ID
    company: CompanyInput
    createdBy: String
}

type fetchSavedDataResponse {
    data: [formData]
    total: Int
}

extend type Mutation {
    addformData(formData: formDataInput): formData
}

extend type Query {
    fetchformData(pageOptions: PageOptionsInput, formId: String): fetchSavedDataResponse
    fetchFormDataFromAnotherDB(dbUrl: String, collection: String, formId: String) : [formData]
    fetchSavedDataByFormStructure(pageOptions: PageOptionsInput, formStructureId: String): fetchSavedDataResponse
    fetchSurveyAndSummaryFormDataById(id: String): formData
}
`

module.exports = formDataSchema;