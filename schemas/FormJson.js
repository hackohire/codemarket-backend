const formJsonSchema = `
type formJson {
    _id: ID
    createdAt: String
    updatedAt: String

    formname: String
    jsonstring: String
}

input formJsonInput {
    _id: ID
    createdAt: String
    updatedAt: String

    formname: String
    jsonstring: String
}

extend type Mutation {
    addformJson(formJson: formJsonInput): formJson
}

extend type Query {
    fetchformJson(formJson: formJsonInput): [formJson]
}
`

module.exports = formJsonSchema;