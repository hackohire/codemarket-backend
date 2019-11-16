const { gql } = require('apollo-server-lambda');

const questionAndAnswerSchema = `
type QuestionAndAnswer {
    _id: ID
    answers: [QuestionAndAnswer]
    text: [descriptionBlocks]
    referenceId: ID
    type: String
    isAnswer: Boolean
    isQuestion: Boolean
    createdBy: User
    createdAt: String
    questionId: QuestionAndAnswer
  }
  
input QuestionAndAnswerInput {
    answers: [QuestionAndAnswerInput]
    referenceId: ID
    type: String
    isAnswer: Boolean
    isQuestion: Boolean
    _id: ID
    text: [InputdescriptionBlock]
    createdBy: ID
    createdAt: String
    questionId: ID
  }

  extend type Query {
    getQuestionAndAnswersByReferenceId(referenceId: String): [QuestionAndAnswer]
    deleteQuestionOrAnswer(questionOrAnswerId: String): String
  }

  extend type Mutation {
    addQuestionOrAnswer(questionOrAnswer: QuestionAndAnswerInput): QuestionAndAnswer
    updateQuestionOrAnswer(questionOrAnswerId: String, text: [InputdescriptionBlock]): QuestionAndAnswer
  }
  `

  module.exports = gql(questionAndAnswerSchema);