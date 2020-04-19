const { gql } = require('apollo-server-lambda');

const homeworkSchema = `
 type HomeworkFields {
     _id: ID
     createAt: String
     updatedAt: String

     assignmentNo: Int
     title: String 
     detailDescription: String
 }

 input HomeworkFieldsInput {
     _id: ID
     createdAt: String
     updatedAt: String

     assignmentNo: Int
     title: String
     detailDescription: String
 }

 extend type Mutation {
     addHomework(homework:HomeworkFieldsInput) : HomeworkFields
 }
`


module.exports = gql(homeworkSchema);