const formDataSchema = `
type formData {
    _id: ID
    createdAt: String
    updatedAt: String

    formname: String
    jsonstring: String
}

input formDataInput {
    _id: ID
    createdAt: String
    updatedAt: String

    formname: String
    jsonstring: String
}

extend type Mutation {
    addformData(formData: formDataInput): formData
}

extend type Query {
    fetchformData(formname: String, formData: formDataInput): [formData]
}
`

module.exports = formDataSchema;