const formJsonSchema = `
type formJson {
    _id: ID
    createdAt: String
    updatedAt: String

    formname: String
    formStructureJSON: JSON
    commonId: String
}

input formJsonInput {
    _id: ID
    createdAt: String
    updatedAt: String

    formname: String
    formStructureJSON: JSON
    commonId: String
}

extend type Mutation {
    addformJson(formJson: formJsonInput): formJson
}

extend type Query {
    fetchformJson(formJson: formJsonInput): [formJson]
    fetchFormStructureById(formId: String): formJson
}
`

module.exports = formJsonSchema;