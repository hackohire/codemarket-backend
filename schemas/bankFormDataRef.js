const bankFormDataRefSchema = `
type bankFormDataRef {
    _id: ID
    createdAt: String
    updatedAt: String

    formname: String
    connectedFormStructureId: ID
    connectedFormDataId: ID
    companyName: String
}

input bankFormDataRefInput {
    _id: ID
    createdAt: String
    updatedAt: String

    formname: String
    connectedFormStructureId: ID
    connectedFormDataId: ID
    companyName: String
}

extend type Mutation {
    addBankFormDataRef(bankFormDataRef: bankFormDataRefInput): bankFormDataRef
}

extend type Query {
    getBankFormDataRefByCompanyName(companyName: String): [bankFormDataRef]
}
`

module.exports = bankFormDataRefSchema;