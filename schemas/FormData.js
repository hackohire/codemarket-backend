const formDataSchema = `
type formData {
    _id: ID
    createdAt: String
    updatedAt: String

    formname: String
    formDataJson: JSON
    createdBy: String
    connectedFormStructureId: ID
}

input formDataInput {
    _id: ID
    createdAt: String
    updatedAt: String

    formname: String
    formDataJson: JSON
    createdBy: String
    connectedFormStructureId: ID
}

extend type Mutation {
    addformData(formData: formDataInput): formData
}

extend type Query {
    fetchformData(formId: String): [formData]
    fetchFormDataFromAnotherDB(dbUrl: String, collection: String, formId: String) : [formData]
}
`

module.exports = formDataSchema;