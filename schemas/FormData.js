const formDataSchema = `
type formData {
    _id: ID
    createdAt: String
    updatedAt: String

    formname: String
    formDataJson: JSON
    connectedFormStructureId: ID
    company: Company
}

input formDataInput {
    _id: ID
    createdAt: String
    updatedAt: String

    formname: String
    formDataJson: JSON
    connectedFormStructureId: ID
    company: CompanyInput
}

extend type Mutation {
    addformData(formData: formDataInput): formData
}

extend type Query {
    fetchformData(formname: String, formData: formDataInput): [formData]
    fetchformDataById(_id: String, connectedFormStructureId: String, formData: formDataInput): [formData]
    fetchFormDataByFormId(formId: String, fetchPrograms: Boolean): formData
}`

module.exports = formDataSchema;