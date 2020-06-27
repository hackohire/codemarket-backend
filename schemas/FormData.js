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
    commonFormId: String
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
    commonFormId: String
}

type fetchSavedDataResponse {
    data: [formData]
    total: Int
}

type mySurveyDataResponse {
    data: [formData]
    total: Int
}

extend type Mutation {
    addformData(formData: formDataInput): formData
}

extend type Query {
    fetchformData(formname: String, formData: formDataInput): [formData]
    fetchformDataById(formDataId: String): [formData]
    fetchFormDataByFormId(formId: String, fetchPrograms: Boolean): formData
    fetchSavedDataByFormStructure(pageOptions: PageOptionsInput, formStructureId: String): fetchSavedDataResponse
    getMySurveyData(pageOptions: PageOptionsInput, id: String): mySurveyDataResponse
    fetchSurveyAndSummaryFormDataById(id: String): formData
}`

module.exports = formDataSchema;