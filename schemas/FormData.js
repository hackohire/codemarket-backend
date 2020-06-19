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
}

input formDataInput {
    _id: ID
    createdAt: String
    updatedAt: String
    formDataId: String
    formname: String
    formDataJson: JSON
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
    fetchformData(formname: String, formData: formDataInput): [formData]
    fetchformDataById(formDataId: String): [formData]
    fetchFormDataByFormId(formId: String, fetchPrograms: Boolean): formData
    fetchSavedDataByFormStructure(pageOptions: PageOptionsInput, formStructureId: String): fetchSavedDataResponse
}`

module.exports = formDataSchema;