const { gql } = require('apollo-server-lambda');

const homeworkSchema = `
 type AssignmentFields {
     _id: ID
     createAt: String
     updatedAt: String

     assignmentNo: String
     title: String 
     detailDescription: String
 }

 input AssignmentFieldsInput {
     _id: ID
     createdAt: String
     updatedAt: String

     assignmentNo: String
     title: String
     detailDescription: String
 }

 extend type Mutation {
     addHomework(assignment:AssignmentFieldsInput) : AssignmentFields
 }
`


module.exports = gql(homeworkSchema);