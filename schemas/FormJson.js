const formJsonSchema = `
type formJson {
    _id: ID
    createdAt: String
    updatedAt: String

    formname: String
    formStructureJSON: JSON
    connectedDB: connectedDBType
}

type connectedDBType {
    _id: ID
    name: String
    mongoUrl: String
}

input inputConnectedDBType {
    _id: ID
    name: String
    mongoUrl: String
}

input formJsonInput {
    _id: ID
    createdAt: String
    updatedAt: String

    formname: String
    formStructureJSON: JSON
    connectedDB: inputConnectedDBType
}

extend type Mutation {
    addformJson(formJson: formJsonInput): formJson
    addDbUrl(name: String, mongoUrl: String) : connectedDBType
    addIntoAnotherDB(formJson: formJsonInput, collection: String) : formJson
}

extend type Query {
    fetchformJson(formJson: formJsonInput): [formJson]
    fetchFormStructureById(formId: String): formJson
}
`

module.exports = formJsonSchema;