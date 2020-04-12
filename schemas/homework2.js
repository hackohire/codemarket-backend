const { gql } = require('apollo-server-lambda');

const homework2Schema = `
 type AssignmentFields2 {
     _id: ID
     createAt: String
     updatedAt: String

     assignmentNo: String
     title: String 
     detailDescription: String
 }

 input AssignmentFieldsInput2 {
     _id: ID
     createdAt: String
     updatedAt: String

     assignmentNo: String
     title: String
     detailDescription: String
 }

 extend type Mutation {
     addHomework2(assignment:AssignmentFieldsInput2) : AssignmentFields2
 }
`

module.exports = gql(homework2Schema);