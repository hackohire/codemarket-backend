const homeBuyerProgramSchema = `
type homeBuyerProgram {
    _id: ID
    createdAt: String
    updatedAt: String

    title: String
    location: String
    benefits: [String]
    featuredLenderLink: String
    websiteLink: String
}

input homeBuyerProgramInput {
    _id: ID
    createdAt: String
    updatedAt: String

    title: String
    location: String
    benefits: [String]
    featuredLenderLink: String
    websiteLink: String
}

extend type Mutation {
    addHomeBuyerProgram(homeBuyerProgram: homeBuyerProgramInput): homeBuyerProgram
}

extend type Query {
    fetchHomeBuyerProgram(location: String, homeBuyerProgram: homeBuyerProgramInput): [homeBuyerProgram]
}
`

module.exports = homeBuyerProgramSchema;