const formJsonSchema = `
type formJson {
    _id: ID
    createdAt: String
    updatedAt: String

    formname: String
    formStructureJSON: JSON
    createdBy: User
    connectedDB: connectedDBType
    commonId: String
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
    createdBy: String
    connectedDB: inputConnectedDBType
    commonId: String
}

extend type Mutation {
    addformJson(formJson: formJsonInput, connectedDBId: String): formJson
    addDbUrl(name: String, mongoUrl: String) : connectedDBType
    addIntoAnotherDB(formJson: formJsonInput, connectedDBId: String, collection: String) : formJson
    deleteFormJson(formId: String): Boolean
}

extend type Query {
    fetchformJson(userId: String): [formJson]
    fetchFormStructureById(formId: String): formJson
}
`

module.exports = formJsonSchema;