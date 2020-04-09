const { gql } = require('apollo-server-lambda');

const homeworkSchema = `
 type AssignmentFields {
     _id: ID
     createAt: String
     updatedAt: String

     assignmentNo: Int
     title: String 
     detailDescription: String
     demoUrl: String
 }

 input AssignmentFieldsInput {
     _id: ID
     createdAt: String
     updatedAt: String

     assignmentNo: Int
     title: String
     detailDescription: String
     demoUrl: String
 }

 extend type Mutation {
     addHomework(assignment:AssignmentFieldsInput) : AssignmentFields
 }
`
module.exports = gql(homeworkSchema);